const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

/**
 * Logs important events to the auditLogs collection
 */
async function addAuditLog(action, details, category, severity, extraData = {}) {
  const db = getFirestore();
  const logId = `LOG-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
  
  const newLog = {
    id: logId,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    action,
    actor: 'System (Cloud Function)',
    actorType: 'system',
    category,
    details,
    severity,
    ...extraData
  };
  
  await db.collection('auditLogs').doc(logId).set(newLog);
  return logId;
}

module.exports = { addAuditLog };
