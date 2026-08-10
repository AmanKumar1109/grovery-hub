const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snap = await db.collection('coupons').get();
  snap.docs.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
  process.exit(0);
}

run();
