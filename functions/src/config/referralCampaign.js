/**
 * Centralized Configuration for the Referral Campaign
 * This allows the business to update rewards easily without modifying code logic.
 */
const CONFIG = {
  // Campaign Identity
  campaignId: "CAMP-REF-V1",
  
  // What does User A get?
  referrerReward: {
    type: "SCRATCH_CARD",
    amount: 30, // ₹30 OFF
    couponValidityDays: 30,
    minOrderValue: 299
  },

  // What does User B get (on signup)?
  referredUserReward: {
    type: "COUPON",
    amount: 30, // ₹30 OFF
    minOrderValue: 299
  },

  // When is the reward given to User A?
  // Could be "Delivered" or "Delivered_And_Returned_Window_Completed" etc.
  rewardTriggerStatus: "Delivered",

  // Is the campaign active?
  isActive: true
};

module.exports = CONFIG;
