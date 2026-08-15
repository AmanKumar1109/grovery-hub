const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { runIdempotentTask } = require('../utils/idempotency');
const { addAuditLog } = require('../utils/auditLogger');
const DEFAULT_CONFIG = require('../config/referralCampaign');

/**
 * Triggers on order update.
 * Checks if the order qualifies for a referral reward.
 */
exports.onOrderUpdated = onDocumentUpdated('orders/{orderId}', async (event) => {
  const change = event.data;
  const orderBefore = change.before.exists ? change.before.data() : {};
  const orderAfter = change.after.data();
  const orderId = event.params.orderId;

    // Check if status changed to the trigger status (e.g. "Delivered").
    // Forcing redeploy
    if (orderBefore.status === orderAfter.status) return null;
    if (orderAfter.status !== DEFAULT_CONFIG.rewardTriggerStatus) return null;

    const db = getFirestore();

    // Fetch dynamic configuration from Firestore
    const settingsDoc = await db.collection('settings').doc('global').get();
    let CONFIG = { ...DEFAULT_CONFIG };
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      if (data.referralCampaignActive !== undefined) {
        CONFIG.isActive = data.referralCampaignActive;
        CONFIG.referrerReward = {
          ...CONFIG.referrerReward,
          amount: data.referrerRewardAmount || CONFIG.referrerReward.amount,
          minOrderValue: data.referralMinOrderValue || CONFIG.referrerReward.minOrderValue,
          couponValidityDays: data.referralCouponValidityDays || CONFIG.referrerReward.couponValidityDays,
          couponMinOrderValue: data.referralCouponMinOrderValue || CONFIG.referrerReward.couponMinOrderValue
        };
        CONFIG.referredUserReward = {
          ...CONFIG.referredUserReward,
          amount: data.referredUserRewardAmount || CONFIG.referredUserReward?.amount || 30,
          couponMinOrderValue: data.referralCouponMinOrderValue || CONFIG.referredUserReward?.couponMinOrderValue || 100,
          couponValidityDays: data.referralCouponValidityDays || CONFIG.referredUserReward?.couponValidityDays || 30
        };
      }
    }

    if (!CONFIG.isActive) return null;

    const userId = orderAfter.userId || orderAfter.customerId || orderAfter.uid;
    if (!userId) return null;

    // Check if this user is a referred user with a pending referral
    const referralQuery = await db.collection('referrals')
      .where('referredUserId', '==', userId)
      .where('status', '==', 'REGISTERED')
      .limit(1)
      .get();

    if (referralQuery.empty) return null;

    const referralDoc = referralQuery.docs[0];
    const referralData = referralDoc.data();
    const referralId = referralDoc.id;

    // Validate qualifying order amount (use subTotal if available, to ignore coupon discounts)
    const qualifyingAmount = parseFloat(orderAfter.subTotal) || parseFloat(orderAfter.totalAmount) || 0;
    if (qualifyingAmount < CONFIG.referrerReward.minOrderValue) {
      console.log(`Order ${orderId} amount ${qualifyingAmount} < ${CONFIG.referrerReward.minOrderValue}. Not qualified.`);
      await referralDoc.ref.update({
        status: 'NOT_QUALIFIED',
        orderId: orderId,
        orderAmount: qualifyingAmount,
        updatedAt: FieldValue.serverTimestamp()
      });
      return null;
    }

    // Check if it's their FIRST qualifying order. 
    // We already check status === 'REGISTERED', so they haven't been rewarded yet.
    // However, to be absolutely safe, we enforce idempotency.

    const eventId = `referral_reward_${referralId}_${orderId}`;

    return await runIdempotentTask(eventId, async (transaction) => {
      // Re-read referral in transaction to ensure it hasn't changed
      const refSnap = await transaction.get(referralDoc.ref);
      if (refSnap.data().status !== 'REGISTERED') {
        throw new Error(`Referral ${referralId} is no longer REGISTERED.`);
      }

      // Create Coupon for Referrer
      const newCouponId = `RWD-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 10000)}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + CONFIG.referrerReward.couponValidityDays);
      const discountAmount = CONFIG.referrerReward.amount;

      const couponRef = db.collection('coupons').doc(newCouponId);
      const couponData = {
        code: newCouponId,
        userId: referralData.referrerId,
        isReferralCoupon: true,
        discountType: 'flat',
        discountValue: discountAmount,
        minOrderValue: CONFIG.referrerReward.couponMinOrderValue,
        maxUses: 1,
        isActive: true,
        validUntil: validUntil.toISOString().split('T')[0],
        sourceReferralId: referralId,
        createdAt: FieldValue.serverTimestamp()
      };

      transaction.set(couponRef, couponData);

      // Create Coupon for Friend (Referred User)
      const friendCouponId = `WELCOME-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 10000)}`;
      const friendValidUntil = new Date();
      friendValidUntil.setDate(friendValidUntil.getDate() + CONFIG.referredUserReward.couponValidityDays);
      const friendDiscountAmount = CONFIG.referredUserReward.amount;

      const friendCouponRef = db.collection('coupons').doc(friendCouponId);
      const friendCouponData = {
        code: friendCouponId,
        userId: referralData.referredUserId,
        isReferralCoupon: true,
        discountType: 'flat',
        discountValue: friendDiscountAmount,
        minOrderValue: CONFIG.referredUserReward.couponMinOrderValue,
        maxUses: 1,
        isActive: true,
        validUntil: friendValidUntil.toISOString().split('T')[0],
        sourceReferralId: referralId,
        createdAt: FieldValue.serverTimestamp()
      };

      transaction.set(friendCouponRef, friendCouponData);

      // Update Referral Status
      transaction.update(referralDoc.ref, {
        status: 'REWARDED',
        orderId: orderId,
        orderAmount: qualifyingAmount,
        orderQualifiedAt: FieldValue.serverTimestamp(),
        rewardedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      // Add audit logs asynchronously (after transaction)
      const auditRef1 = db.collection('auditLogs').doc();
      transaction.set(auditRef1, {
        id: auditRef1.id,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'REFERRAL_COUPON_REWARDED',
        actor: 'System (Cloud Function)',
        actorType: 'system',
        category: 'Referrals',
        details: `Rewarded referrer ${referralData.referrerId} with coupon ${newCouponId} for order ${orderId}`,
        severity: 'success',
        referralId: referralId,
        userId: referralData.referrerId,
        orderId: orderId,
        couponId: newCouponId
      });

      const auditRef2 = db.collection('auditLogs').doc();
      transaction.set(auditRef2, {
        id: auditRef2.id,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'REFERRAL_COUPON_REWARDED',
        actor: 'System (Cloud Function)',
        actorType: 'system',
        category: 'Referrals',
        details: `Rewarded referred user ${referralData.referredUserId} with coupon ${friendCouponId} for order ${orderId}`,
        severity: 'success',
        referralId: referralId,
        userId: referralData.referredUserId,
        orderId: orderId,
        couponId: friendCouponId
      });

      return { couponId: newCouponId };
    });
  });
