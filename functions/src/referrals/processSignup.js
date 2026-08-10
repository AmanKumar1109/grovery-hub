const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { addAuditLog } = require('../utils/auditLogger');
const CONFIG = require('../config/referralCampaign');

/**
 * Triggers when a new user signs up.
 * Validates the referral code and attributes the referral securely.
 */
exports.onUserCreated = onDocumentCreated('users/{userId}', async (event) => {
  const snap = event.data;
  const newUser = snap.data();
  const newUserId = event.params.userId;
    
    // 1. Generate a unique referral code for the NEW user if they don't have one
    const db = admin.firestore();
    if (!newUser.myReferralCode) {
      const baseName = (newUser.fullName || 'user').split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const randomDigits = Math.floor(100 + Math.random() * 900);
      const myReferralCode = `${baseName}${randomDigits}${newUserId.substring(0, 3).toUpperCase()}`;

      await db.collection('users').doc(newUserId).set({
        myReferralCode: myReferralCode
      }, { merge: true });
    }

    // 2. Check if the user was referred by someone else
    const referredByCode = newUser.referredByCode;
    if (!referredByCode) return null; // Not a referred user

    if (!CONFIG.isActive) {
      console.log(`Referral campaign is inactive. Ignored code ${referredByCode}.`);
      return null;
    }

    try {
      // Find referrer by code
      const referrerQuery = await db.collection('users')
        .where('myReferralCode', '==', referredByCode)
        .limit(1)
        .get();

      if (referrerQuery.empty) {
        console.warn(`Referral code ${referredByCode} not found.`);
        return null;
      }

      const referrerDoc = referrerQuery.docs[0];
      const referrerId = referrerDoc.id;

      // Prevent self-referral
      if (referrerId === newUserId) {
        console.warn(`Self-referral attempted by ${newUserId}.`);
        return null;
      }

      // Ensure a referral doesn't already exist for this new user
      const existingRefQuery = await db.collection('referrals')
        .where('referredUserId', '==', newUserId)
        .limit(1)
        .get();

      if (!existingRefQuery.empty) {
        console.warn(`User ${newUserId} was already referred.`);
        return null;
      }

      // Create the immutable referral record
      const referralId = `REF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      
      const referralData = {
        id: referralId,
        referrerId: referrerId,
        referredUserId: newUserId,
        campaignId: CONFIG.campaignId,
        status: 'REGISTERED',
        orderId: null,
        orderAmount: null,
        registeredAt: admin.firestore.FieldValue.serverTimestamp(),
        orderQualifiedAt: null,
        rewardProcessingAt: null,
        rewardedAt: null,
        scratchCardId: null,
        couponId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('referrals').doc(referralId).set(referralData);
      
      await addAuditLog(
        'REFERRAL_CREATED',
        `User ${newUserId} signed up using referral code from ${referrerId}`,
        'Referrals',
        'info',
        { referralId, userId: referrerId, referredUserId: newUserId }
      );

      // Generate the reward coupon for the newly referred user (User B)
      const userBCouponId = `WELCOME-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30); // 30 days validity

      const couponData = {
        code: userBCouponId,
        userId: newUserId, // Locked to User B
        isReferralCoupon: true,
        discountType: 'flat',
        discountValue: CONFIG.referredUserReward.amount,
        minOrderValue: CONFIG.referredUserReward.minOrderValue,
        maxUses: 1,
        isActive: true,
        validUntil: validUntil.toISOString().split('T')[0],
        sourceReferralId: referralId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('coupons').doc(userBCouponId).set(couponData);

      console.log(`Successfully attributed referral ${referralId} and gave User B coupon ${userBCouponId}`);
      return true;
    } catch (error) {
      console.error('Error processing referral attribution:', error);
      return null;
    }
  });
