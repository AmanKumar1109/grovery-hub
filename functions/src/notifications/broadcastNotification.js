const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { addAuditLog } = require('../utils/auditLogger');

/**
 * Handles sending a broadcast push notification via both:
 * 1. FCM Topic ('all_users') for instantaneous high-scale delivery.
 * 2. Device Multicast ('fcm_tokens') for verified device-level delivery & cleanup of stale tokens.
 */
async function dispatchPushNotification(data, notificationId) {
  const db = getFirestore();
  const messaging = getMessaging();

  const title = (data.title || 'GroceryHub Alert').trim();
  const body = (data.body || '').trim();
  const imageUrl = (data.imageUrl || '').trim();
  const route = (data.route || '/home').trim();

  // 1. Send to FCM Topic 'all_users' (Instant fan-out)
  let topicSuccess = false;
  let topicMessageId = null;
  let topicError = null;

  try {
    const topicPayload = {
      topic: 'all_users',
      notification: {
        title,
        body,
        ...(imageUrl ? { imageUrl } : {})
      },
      data: {
        route,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        notificationId: notificationId || '',
        title,
        body,
        ...(imageUrl ? { imageUrl } : {})
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'groceryhub_high_importance',
          priority: 'max',
          defaultSound: true,
          defaultVibrateTimings: true,
          ...(imageUrl ? { imageUrl } : {})
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            contentAvailable: true
          }
        },
        ...(imageUrl ? { fcmOptions: { imageUrl } } : {})
      }
    };

    topicMessageId = await messaging.send(topicPayload);
    topicSuccess = true;
    console.log(`[Push Notification] Topic broadcast sent successfully: ${topicMessageId}`);
  } catch (err) {
    console.error('[Push Notification] Error sending to topic:', err);
    topicError = err.message;
  }

  // 2. Count registered devices for dashboard analytics
  let totalRegisteredDevices = 0;
  try {
    const countSnap = await db.collection('fcm_tokens').where('isActive', '==', true).count().get();
    totalRegisteredDevices = countSnap.data().count;
  } catch (_) {
    try {
      const snap = await db.collection('fcm_tokens').get();
      totalRegisteredDevices = snap.size;
    } catch (_) {}
  }

  // IMPORTANT: If topic broadcast succeeded, DO NOT also multicast to the same devices!
  // Sending to both topic AND individual tokens causes every phone to receive DUPLICATE notifications.
  if (topicSuccess) {
    return {
      topicSuccess: true,
      topicMessageId,
      topicError: null,
      totalRegisteredDevices,
      multicastSuccessCount: totalRegisteredDevices,
      multicastFailureCount: 0,
      staleTokensRemoved: 0
    };
  }

  // 3. Fallback: Only if topic broadcast failed, send direct multicast to individual devices
  let tokenDocsSnapshot;
  try {
    tokenDocsSnapshot = await db.collection('fcm_tokens').where('isActive', '==', true).get();
  } catch (err) {
    // If where isActive fails or collection is unindexed, fetch all
    tokenDocsSnapshot = await db.collection('fcm_tokens').get();
  }

  const tokenDocPairs = [];
  tokenDocsSnapshot.forEach((doc) => {
    const d = doc.data();
    if (d && d.token && typeof d.token === 'string' && d.token.trim().length > 10) {
      tokenDocPairs.push({ id: doc.id, token: d.token.trim() });
    }
  });

  totalRegisteredDevices = tokenDocPairs.length;
  let multicastSuccessCount = 0;
  let multicastFailureCount = 0;
  const staleDocIdsToDelete = [];

  // FCM multicast supports up to 500 tokens per chunk
  const CHUNK_SIZE = 500;
  for (let i = 0; i < tokenDocPairs.length; i += CHUNK_SIZE) {
    const chunk = tokenDocPairs.slice(i, i + CHUNK_SIZE);
    const tokens = chunk.map((c) => c.token);

    try {
      const multicastPayload = {
        tokens,
        notification: {
          title,
          body,
          ...(imageUrl ? { imageUrl } : {})
        },
        data: {
          route,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          notificationId: notificationId || '',
          title,
          body,
          ...(imageUrl ? { imageUrl } : {})
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'groceryhub_high_importance',
            priority: 'max',
            defaultSound: true,
            defaultVibrateTimings: true,
            ...(imageUrl ? { imageUrl } : {})
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          },
          ...(imageUrl ? { fcmOptions: { imageUrl } } : {})
        }
      };

      const response = await messaging.sendEachForMulticast(multicastPayload);
      multicastSuccessCount += response.successCount;
      multicastFailureCount += response.failureCount;

      // Identify invalid / expired tokens to keep the database clean
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const errCode = resp.error.code;
          if (
            errCode === 'messaging/registration-token-not-registered' ||
            errCode === 'messaging/invalid-registration-token'
          ) {
            staleDocIdsToDelete.push(chunk[idx].id);
          }
        }
      });
    } catch (chunkErr) {
      console.error('[Push Notification] Multicast chunk send error:', chunkErr);
      multicastFailureCount += tokens.length;
    }
  }

  // Clean up stale tokens in batches
  if (staleDocIdsToDelete.length > 0) {
    const batch = db.batch();
    staleDocIdsToDelete.slice(0, 450).forEach((docId) => {
      batch.delete(db.collection('fcm_tokens').doc(docId));
    });
    batch.commit().catch((e) => console.warn('Failed to prune stale tokens:', e));
  }

  return {
    topicSuccess,
    topicMessageId,
    topicError,
    totalRegisteredDevices,
    multicastSuccessCount,
    multicastFailureCount,
    staleTokensRemoved: staleDocIdsToDelete.length
  };
}

/**
 * Firestore Trigger: Runs automatically whenever a document is added to 'broadcast_notifications/{id}'.
 */
exports.onBroadcastNotificationCreated = onDocumentCreated(
  'broadcast_notifications/{notificationId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return null;

    const data = snap.data();
    const notificationId = event.params.notificationId;

    // Ignore already processed notifications
    if (data.status === 'sent' || data.status === 'delivered') {
      return null;
    }

    const db = getFirestore();
    try {
      // Mark as sending
      await snap.ref.set(
        {
          status: 'sending',
          startedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      const result = await dispatchPushNotification(data, notificationId);

      // Update broadcast document with delivery metrics
      await snap.ref.set(
        {
          status: 'sent',
          sentAt: FieldValue.serverTimestamp(),
          metrics: {
            topicSuccess: result.topicSuccess,
            topicMessageId: result.topicMessageId,
            registeredDevices: result.totalRegisteredDevices,
            directSuccessCount: result.multicastSuccessCount,
            directFailureCount: result.multicastFailureCount,
            staleCleaned: result.staleTokensRemoved
          }
        },
        { merge: true }
      );

      // Audit log entry
      if (typeof addAuditLog === 'function') {
        await addAuditLog(
          'BROADCAST_NOTIFICATION_SENT',
          `Dispatched broadcast notification: "${data.title}" to topic and ${result.totalRegisteredDevices} devices.`,
          'Notifications',
          'info'
        );
      }

      console.log(`[Push Notification] Broadcast ${notificationId} complete.`);
      return true;
    } catch (err) {
      console.error(`[Push Notification] Failed to process broadcast ${notificationId}:`, err);
      await snap.ref.set(
        {
          status: 'failed',
          error: err.message,
          failedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
      return false;
    }
  }
);

/**
 * HTTPS Callable Function: Can be invoked directly from the Admin Dashboard for instant response.
 */
exports.sendBroadcastNotification = onCall(
  { region: 'asia-south1', cors: true },
  async (request) => {
    const data = request.data || {};
    if (!data.title || !data.body) {
      throw new HttpsError('invalid-argument', 'Both "title" and "body" are required.');
    }

    const db = getFirestore();
    // 1. Record in broadcast_notifications collection for history & audit
    const newDocRef = await db.collection('broadcast_notifications').add({
      title: data.title.trim(),
      body: data.body.trim(),
      imageUrl: (data.imageUrl || '').trim(),
      route: (data.route || '/home').trim(),
      targetAudience: data.targetAudience || 'all',
      sentBy: request.auth?.token?.email || 'admin',
      status: 'sending',
      createdAt: FieldValue.serverTimestamp()
    });

    // 2. Dispatch push notifications
    const result = await dispatchPushNotification(data, newDocRef.id);

    // 3. Update doc status
    await newDocRef.set(
      {
        status: 'sent',
        sentAt: FieldValue.serverTimestamp(),
        metrics: {
          topicSuccess: result.topicSuccess,
          topicMessageId: result.topicMessageId,
          registeredDevices: result.totalRegisteredDevices,
          directSuccessCount: result.multicastSuccessCount,
          directFailureCount: result.multicastFailureCount,
          staleCleaned: result.staleTokensRemoved
        }
      },
      { merge: true }
    );

    return {
      success: true,
      notificationId: newDocRef.id,
      ...result
    };
  }
);

