const admin = require('firebase-admin');
admin.initializeApp();

const processSignup = require('./referrals/processSignup');
const referralOrderHandler = require('./orders/referralOrderHandler');

exports.onUserCreated = processSignup.onUserCreated;
exports.onOrderUpdated = referralOrderHandler.onOrderUpdated;
