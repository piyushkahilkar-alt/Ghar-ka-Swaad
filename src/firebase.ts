import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ApplicationVerifier } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Modular functions for Authentication and Database

export const saveUserData = async (uid: string, data: any) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp()
  }, { merge: true }); // Use merge: true so it doesn't overwrite existing
};

export const signupUser = async (email: string, password: string, userData: any) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Optimistically save user data in the background so it doesn't block the UI
  await saveUserData(result.user.uid, userData);
  return result.user;
};

export const loginUser = async (email: string, password: string, rememberMe: boolean = true) => {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  const result = await signInWithEmailAndPassword(auth, email, password);
  const userRef = doc(db, 'users', result.user.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    // If not registered through normal flow, we'll gracefully allow but warn.
    await saveUserData(result.user.uid, { email: result.user.email, name: 'Customer' });
  }
  return { user: result.user, userData: userDoc.exists() ? userDoc.data() : { email: result.user.email } };
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const userRef = doc(db, 'users', result.user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Create minimal profile if new user
    const userData = { email: result.user.email, name: result.user.displayName || 'Customer' };
    await saveUserData(result.user.uid, userData);
    return { user: result.user, userData, isNewUser: true };
  }
  return { user: result.user, userData: userDoc.data(), isNewUser: false };
};

export const setupRecaptcha = (containerId: string) => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      }
    });
  }
};

export const loginWithEmailOTP = async (email: string) => {
  const dummyPassword = "OtpAuth123!@";
  try {
    const result = await signInWithEmailAndPassword(auth, email, dummyPassword);
    const userRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userRef);
    return { user: result.user, userData: userDoc.exists() ? userDoc.data() : { email: result.user.email } };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, dummyPassword);
        const userData = { email: result.user.email, name: 'Customer' };
        await saveUserData(result.user.uid, userData);
        return { user: result.user, userData, isNewUser: true };
      } catch (innerError: any) {
        if (innerError.code === 'auth/operation-not-allowed') {
           throw new Error("Email/Password Authentication is not enabled. Please enable it in the Firebase Console -> Authentication -> Sign-in methods.");
        }
        throw innerError;
      }
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Email/Password Authentication is not enabled. Please enable it in the Firebase Console -> Authentication -> Sign-in methods.");
    }
    throw error;
  }
};

export const verifyOtpPhone = async (confirmationResult: any, otp: string) => {
  const result = await confirmationResult.confirm(otp);
  const userRef = doc(db, 'users', result.user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    const userData = { phone: result.user.phoneNumber, name: 'Customer' };
    await saveUserData(result.user.uid, userData);
    return { user: result.user, userData, isNewUser: true };
  }
  
  return { user: result.user, userData: userDoc.data(), isNewUser: false };
};

export const requestEmailOTP = async (email: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  await setDoc(doc(db, "otps", email.toLowerCase()), {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
  
  return otp;
}

export const sendEmailOTP = async (email: string, otp: string) => {
  const data = {
    service_id: "service_vkbkgck",
    template_id: "template_clksozt",
    user_id: "nTUZKHUOCZ3MpdmFQ",
    template_params: {
      email: email,
      otp: otp
    }
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EmailJS failed: ${errorText}`);
  }
}

export const verifyEmailOTPFromFirestore = async (email: string, otp: string) => {
  const otpRef = doc(db, "otps", email.toLowerCase());
  const otpDoc = await getDoc(otpRef);
  if (!otpDoc.exists()) {
    throw new Error("OTP not found. Please request a new one.");
  }
  
  const data = otpDoc.data();
  if (Date.now() > data.expiresAt) {
    await deleteDoc(otpRef);
    throw new Error("OTP has expired.");
  }

  if (data.otp !== otp) {
    throw new Error("Invalid OTP");
  }
  
  const result = await loginWithEmailOTP(email);
  await deleteDoc(otpRef);
  return result;
}
