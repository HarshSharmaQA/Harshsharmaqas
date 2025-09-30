
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check for missing config values and throw an error if any are missing
for (const [key, value] of Object.entries(firebaseConfig)) {
    if (!value) {
        throw new Error(`Error: Missing Firebase config value for ${key}. Please make sure your .env.local file is correctly set up with all NEXT_PUBLIC_FIREBASE_ variables.`);
    }
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Initialize Analytics if it's supported, but don't block app load
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported && firebaseConfig.appId) { // Ensure appId exists before initializing
      getAnalytics(app);
    }
  });
}


export { app, db };
