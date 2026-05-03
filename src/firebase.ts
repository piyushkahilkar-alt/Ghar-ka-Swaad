import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCzGce1RgiLVhMnplr-xP-W2ts6FWmVobU",
  authDomain: "gharkaswadd-2b9ab.firebaseapp.com",
  projectId: "gharkaswadd-2b9ab",
  storageBucket: "gharkaswadd-2b9ab.firebasestorage.app",
  messagingSenderId: "1096066518004",
  appId: "1:1096066518004:web:ea4f0d4c0c46639f9207a1",
  measurementId: "G-3B26ZTW023"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
