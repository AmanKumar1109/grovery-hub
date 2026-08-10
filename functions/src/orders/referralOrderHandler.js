const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { runIdempotentTask } = require('../utils/idempotency');
const { addAuditLog } = require('../utils/auditLogger');
const CONFIG = require('../config/referralCampaign');

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
    if (orderAfter.status !== CONFIG.rewardTriggerStatus) return null;

    if (!CONFIG.isActive) return null;

    const userId = orderAfter.userId || orderAfter.customerId || orderAfter.uid;
    if (!userId) return null;

    const db = getFirestore();

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

      // Create Coupon Directly (Skipping Scratch Card)
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

      // Update Referral Status
      transaction.update(referralDoc.ref, {
        status: 'REWARDED',
        orderId: orderId,
        orderAmount: qualifyingAmount,
        orderQualifiedAt: FieldValue.serverTimestamp(),
        rewardedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      // Add audit log asynchronously (after transaction)
      // Note: Transaction shouldn't contain side-effects that can't be rolled back,
      // but Firestore writes are queued in the transaction.
      const auditRef = db.collection('auditLogs').doc();
      transaction.set(auditRef, {
        id: auditRef.id,
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

      return { couponId: newCouponId };
    });
  });
