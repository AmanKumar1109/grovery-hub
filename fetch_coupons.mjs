import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-9URBLBLsmO6qzxRVMy7gac-I1URji2s",
  authDomain: "thegroceryhub-7113c.firebaseapp.com",
  projectId: "thegroceryhub-7113c",
  storageBucket: "thegroceryhub-7113c.firebasestorage.app",
  messagingSenderId: "677288573686",
  appId: "1:677288573686:web:a8e615b15c4d33b177cad7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'coupons'));
  snap.docs.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
  process.exit(0);
}

run();
