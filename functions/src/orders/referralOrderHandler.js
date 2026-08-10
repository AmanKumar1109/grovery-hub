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

    // Validate qualifying order amount
    const totalAmount = parseFloat(orderAfter.totalAmount) || 0;
    if (totalAmount < CONFIG.referrerReward.minOrderValue) {
      console.log(`Order ${orderId} amount ${totalAmount} < ${CONFIG.referrerReward.minOrderValue}. Not qualified.`);
      await referralDoc.ref.update({
        status: 'NOT_QUALIFIED',
        orderId: orderId,
        orderAmount: totalAmount,
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

      // Create Scratch Card
      const scratchCardId = `SC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      const scratchCardRef = db.collection('scratchCards').doc(scratchCardId);

      const scratchCardData = {
        id: scratchCardId,
        userId: referralData.referrerId,
        referralId: referralId,
        rewardAmount: CONFIG.referrerReward.amount,
        status: 'AVAILABLE',
        unlockedAt: null, // Will be set when scratched
        scratchedAt: null,
        expiresAt: null, // Could add expiry logic if configured
        couponId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      transaction.set(scratchCardRef, scratchCardData);

      // Update Referral Status
      transaction.update(referralDoc.ref, {
        status: 'REWARDED',
        orderId: orderId,
        orderAmount: orderAfter.totalAmount || orderAfter.amount || 0,
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
        action: 'SCRATCH_CARD_UNLOCKED',
        actor: 'System (Cloud Function)',
        actorType: 'system',
        category: 'Referrals',
        details: `Unlocked scratch card ${scratchCardId} for referrer ${referralData.referrerId} (Order ${orderId})`,
        severity: 'success',
        referralId: referralId,
        userId: referralData.referrerId,
        orderId: orderId,
        scratchCardId: scratchCardId
      });

      return { scratchCardId };
    });
  });
