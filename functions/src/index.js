const admin = require('firebase-admin');
admin.initializeApp();

const processSignup = require('./referrals/processSignup');
const referralOrderHandler = require('./orders/referralOrderHandler');
const unlockScratchCard = require('./scratchCards/unlockScratchCard');

exports.onUserCreated = processSignup.onUserCreated;
exports.onOrderUpdated = referralOrderHandler.onOrderUpdated;
exports.scratchCardUnlock = unlockScratchCard.scratchCardUnlock;
