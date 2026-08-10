const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

/**
 * Ensures a given block of code runs exactly once per event.
 * @param {string} eventId - Unique identifier for the event.
 * @param {Function} task - The async task to run.
 */
async function runIdempotentTask(eventId, task) {
  const db = getFirestore();
  const idempotencyRef = db.collection('idempotency').doc(eventId);

  return db.runTransaction(async (t) => {
    const doc = await t.get(idempotencyRef);
    
    if (doc.exists) {
      console.log(`[Idempotency] Event ${eventId} already processed.`);
      return { status: 'already_processed', data: doc.data().result || null };
    }

    // Execute task
    const result = await task(t);

    // Save success state
    t.set(idempotencyRef, {
      processedAt: FieldValue.serverTimestamp(),
      result: result || null
    });

    return { status: 'processed', data: result };
  });
}

module.exports = { runIdempotentTask };
