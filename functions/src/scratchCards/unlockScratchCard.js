const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const CONFIG = require('../config/referralCampaign');

/**
 * HTTPS Callable function to "scratch" a card and generate a coupon.
 */
exports.scratchCardUnlock = onCall(async (request) => {
  // Authentication check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in to scratch a card.');
  }

  const userId = request.auth.uid;
  const { scratchCardId } = request.data;

  if (!scratchCardId) {
    throw new HttpsError('invalid-argument', 'scratchCardId is required.');
  }

  const db = getFirestore();

  const scratchCardRef = db.collection('scratchCards').doc(scratchCardId);

  try {
    return await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(scratchCardRef);

      if (!doc.exists) {
        throw new HttpsError('not-found', 'Scratch card not found.');
      }

      const cardData = doc.data();

      // Ownership check
      if (cardData.userId !== userId) {
        throw new HttpsError('permission-denied', 'This scratch card does not belong to you.');
      }

      // If already scratched, just return the coupon ID securely (idempotent for the client)
      if (cardData.status === 'SCRATCHED' || cardData.status === 'COUPON_GENERATED') {
        return { 
          status: 'already_scratched', 
          couponId: cardData.couponId,
          rewardAmount: cardData.rewardAmount 
        };
      }

      // Ensure it is available to be scratched
      if (cardData.status !== 'AVAILABLE') {
        throw new HttpsError('failed-precondition', `Card cannot be scratched (Status: ${cardData.status})`);
      }

      // Generate the Coupon
      const newCouponId = `RWD-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 10000)}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + CONFIG.referrerReward.couponValidityDays);
      const discountAmount = cardData.rewardAmount;

      const couponRef = db.collection('coupons').doc(newCouponId);
      const couponData = {
        code: newCouponId,
        userId: userId, // Locks the coupon to this user
        isReferralCoupon: true,
        discountType: 'flat',
        discountValue: discountAmount,
        minOrderValue: CONFIG.referrerReward.minOrderValue,
        maxUses: 1,
        isActive: true,
        validUntil: validUntil.toISOString().split('T')[0], // YYYY-MM-DD
        sourceReferralId: cardData.referralId || null,
        createdAt: FieldValue.serverTimestamp()
      };

      transaction.set(couponRef, couponData);

      // Update the Scratch Card
      transaction.update(scratchCardRef, {
        status: 'SCRATCHED',
        couponId: newCouponId,
        scratchedAt: FieldValue.serverTimestamp(),
        discountValue: discountAmount,
        updatedAt: FieldValue.serverTimestamp()
      });

      // Audit Log
      const auditRef = db.collection('auditLogs').doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        action: 'SCRATCH_CARD_SCRATCHED',
        actor: 'User',
        actorType: 'user',
        category: 'Referrals',
        details: `User scratched card ${scratchCardId} and received coupon ${couponId}`,
        severity: 'info',
        userId: userId,
        scratchCardId: scratchCardId,
        couponId: couponId
      });

      return { 
        status: 'success', 
        couponId: couponId, 
        rewardAmount: cardData.rewardAmount 
      };
    });
  } catch (error) {
    console.error("Scratch Card Error:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'An error occurred while scratching the card.');
  }
});
