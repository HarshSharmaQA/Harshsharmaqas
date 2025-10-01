
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmOi5flMyV0VKmuxrAKnPha9iDKT3Dl3M",
  authDomain: "jobwalaqa.firebaseapp.com",
  projectId: "jobwalaqa",
  storageBucket: "jobwalaqa.appspot.com",
  messagingSenderId: "1072396490172",
  appId: "1:1072396490172:web:7f6b5b5b4b1b3b5d4e4b7b",
  measurementId: "G-K1VTG7MBJT"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Initialize Analytics if it's supported, but don't block app load
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported && firebaseConfig.measurementId) { 
      getAnalytics(app);
    }
  });
}


export { app, db };
