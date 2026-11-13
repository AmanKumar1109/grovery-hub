const { setGlobalOptions } = require('firebase-functions/v2');
setGlobalOptions({ region: 'asia-south1' });

const admin = require('firebase-admin');
admin.initializeApp();

const processSignup = require('./referrals/processSignup');
const referralOrderHandler = require('./orders/referralOrderHandler');
const { initiateSabPaisaPayment } = require('./sabpaisa/initiatePayment');
const { verifySabPaisaPayment } = require('./sabpaisa/verifyPayment');
const {
  onBroadcastNotificationCreated,
  sendBroadcastNotification
} = require('./notifications/broadcastNotification');

exports.onUserCreated = processSignup.onUserCreated;
exports.onOrderUpdated = referralOrderHandler.onOrderUpdated;
exports.initiateSabPaisaPayment = initiateSabPaisaPayment;
exports.verifySabPaisaPayment = verifySabPaisaPayment;
exports.onBroadcastNotificationCreated = onBroadcastNotificationCreated;
exports.sendBroadcastNotification = sendBroadcastNotification;

