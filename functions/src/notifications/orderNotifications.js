const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { addAuditLog } = require('../utils/auditLogger');

/**
 * Helper to collect all valid FCM tokens for a given user & order.
 */
async function getTargetUserTokens(db, userId, directToken) {
  const tokenSet = new Set();

  if (directToken && typeof directToken === 'string' && directToken.trim().length > 10) {
    tokenSet.add(directToken.trim());
  }

  if (userId && typeof userId === 'string' && userId.trim().length > 0) {
    const trimmedUid = userId.trim();

    // 1. Fetch from 'fcm_tokens' collection
    try {
      const fcmTokensSnap = await db.collection('fcm_tokens')
        .where('userId', '==', trimmedUid)
        .where('isActive', '==', true)
        .get();

      fcmTokensSnap.forEach((doc) => {
        const d = doc.data();
        if (d && d.token && typeof d.token === 'string' && d.token.trim().length > 10) {
          tokenSet.add(d.token.trim());
        }
      });
    } catch (e) {
      console.warn(`[OrderNotification] Failed to query fcm_tokens for ${trimmedUid}:`, e.message);
    }

    // 2. Fetch from 'users/{userId}' document
    try {
      const userDoc = await db.collection('users').doc(trimmedUid).get();
      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        if (userData.fcmToken && typeof userData.fcmToken === 'string' && userData.fcmToken.trim().length > 10) {
          tokenSet.add(userData.fcmToken.trim());
        }
        if (Array.isArray(userData.fcmTokens)) {
          userData.fcmTokens.forEach((t) => {
            if (t && typeof t === 'string' && t.trim().length > 10) {
              tokenSet.add(t.trim());
            }
          });
        }
      }
    } catch (e) {
      console.warn(`[OrderNotification] Failed to query users doc for ${trimmedUid}:`, e.message);
    }
  }

  return Array.from(tokenSet);
}

/**
 * Sends a high-priority push notification to a list of tokens.
 */
async function sendPushToTokens(tokens, { title, body, data, orderId }) {
  if (!tokens || tokens.length === 0) {
    console.log(`[OrderNotification] No registered FCM tokens found for order #${orderId}`);
    return { successCount: 0, failureCount: 0 };
  }

  const messaging = admin.messaging();
  const payload = {
    tokens,
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      title,
      body,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'groceryhub_high_importance',
        priority: 'max',
        defaultSound: true,
        defaultVibrateTimings: true,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          contentAvailable: true,
        },
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(payload);
    console.log(
      `[OrderNotification] Sent push for #${orderId}: ${response.successCount} succeeded, ${response.failureCount} failed.`
    );
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (err) {
    console.error(`[OrderNotification] Multicast error for order #${orderId}:`, err);
    return { successCount: 0, failureCount: tokens.length, error: err.message };
  }
}

/**
 * 1. TRIGGER: Order Created
 * Automatically sends an instant "Order Placed & Confirmed" push notification to the customer.
 */
exports.onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
  const snap = event.data;
  if (!snap) return null;

  const orderData = snap.data() || {};
  const orderDocId = event.params.orderId;
  const displayId = orderData.orderId || orderDocId;
  const userId = orderData.userId || orderData.customerId || orderData.uid;
  const customerName = orderData.customerName || 'Customer';
  const totalAmount = orderData.totalAmount || orderData.subTotal || 0;

  const db = getFirestore();

  console.log(`[OrderNotification] onOrderCreated triggered for order #${displayId} (user: ${userId})`);

  // Collect target tokens
  const tokens = await getTargetUserTokens(db, userId, orderData.fcmToken);

  const title = '🎉 Order Confirmed!';
  const body = `Thank you ${customerName}! Your order #${displayId} of ₹${totalAmount} has been placed. We are preparing your fresh groceries for delivery.`;

  const notificationData = {
    route: '/orders',
    type: 'order_status',
    orderId: String(displayId),
    status: orderData.status || 'Order Received',
    createdAt: new Date().toISOString(),
  };

  const result = await sendPushToTokens(tokens, {
    title,
    body,
    data: notificationData,
    orderId: displayId,
  });

  // Record audit log
  await addAuditLog(
    'NOTIFICATION_ORDER_CREATED',
    'System',
    `Sent order confirmation notification for #${displayId} to ${result.successCount} device(s)`,
    { orderId: displayId, userId, successCount: result.successCount }
  );

  return result;
});

/**
 * 2. TRIGGER: Order Updated
 * Automatically notifies the customer when their order is marked as:
 * - "Delivered"
 * - "Out for Delivery"
 * - "Cancelled"
 */
exports.onOrderStatusUpdated = onDocumentUpdated('orders/{orderId}', async (event) => {
  const change = event.data;
  if (!change) return null;

  const orderBefore = change.before.data() || {};
  const orderAfter = change.after.data() || {};
  const orderDocId = event.params.orderId;
  const displayId = orderAfter.orderId || orderDocId;
  const userId = orderAfter.userId || orderAfter.customerId || orderAfter.uid;

  const statusBefore = (orderBefore.status || '').trim();
  const statusAfter = (orderAfter.status || '').trim();

  // If status did not change, nothing to notify
  if (statusBefore === statusAfter || !statusAfter) {
    return null;
  }

  console.log(
    `[OrderNotification] onOrderStatusUpdated for #${displayId}: status changed from "${statusBefore}" to "${statusAfter}"`
  );

  const normalizedStatus = statusAfter.toLowerCase();

  let title = '';
  let body = '';

  if (normalizedStatus === 'delivered') {
    title = '🛍️ Order Delivered!';
    body = `Great news! Your GroceryHub order #${displayId} has been safely delivered. Thank you for shopping with us!`;
  } else if (normalizedStatus === 'out for delivery') {
    title = '🚚 Order Out for Delivery!';
    body = `Your order #${displayId} is on the way with our delivery partner and will arrive shortly at your doorstep.`;
  } else if (normalizedStatus === 'cancelled') {
    title = '⚠️ Order Cancelled';
    body = `Your order #${displayId} has been cancelled. Any prepaid amount will be refunded to your source payment method.`;
  } else {
    // Other intermediate status changes (e.g. Preparing, Packed)
    return null;
  }

  const db = getFirestore();
  const tokens = await getTargetUserTokens(db, userId, orderAfter.fcmToken);

  const notificationData = {
    route: '/orders',
    type: 'order_status',
    orderId: String(displayId),
    status: statusAfter,
    updatedAt: new Date().toISOString(),
  };

  const result = await sendPushToTokens(tokens, {
    title,
    body,
    data: notificationData,
    orderId: displayId,
  });

  // Record audit log
  await addAuditLog(
    `NOTIFICATION_ORDER_${normalizedStatus.toUpperCase().replace(/\s+/g, '_')}`,
    'System',
    `Sent order status (${statusAfter}) notification for #${displayId} to ${result.successCount} device(s)`,
    { orderId: displayId, userId, status: statusAfter, successCount: result.successCount }
  );

  return result;
});

