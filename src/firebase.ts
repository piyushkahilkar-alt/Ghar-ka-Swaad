import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCzGce1RgiLVhMnplr-xP-W2ts6FWmVobU",
  authDomain: "gharkaswadd-2b9ab.firebaseapp.com",
  projectId: "gharkaswadd-2b9ab",
  storageBucket: "gharkaswadd-2b9ab.firebasestorage.app",
  messagingSenderId: "1096066518004",
  appId: "1:1096066518004:web:ea4f0d4c0c46639f9207a1",
  measurementId: "G-3B26ZTW023"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

// Modular functions for Authentication and Database

export const saveUserData = async (uid: string, data: any) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp()
  });
};

export const signupUser = async (email: string, password: string, userData: any) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Optimistically save user data in the background so it doesn't block the UI
  saveUserData(result.user.uid, userData).catch(err => console.error("Error saving user data:", err));
  return result.user;
};

export const loginUser = async (email: string, password: string, rememberMe: boolean = true) => {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const result = await signInWithEmailAndPassword(auth, email, password);
  const userRef = doc(db, 'users', result.user.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not registered properly. Please register first.');
  }
  return { user: result.user, userData: userDoc.data() };
};
