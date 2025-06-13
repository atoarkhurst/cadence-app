// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbF030xl3Peud-WD8BPS6NUWWwDS_tK-g",
  authDomain: "cadence-e3b43.firebaseapp.com",
  projectId: "cadence-e3b43",
  storageBucket: "cadence-e3b43.appspot.com",
  messagingSenderId: "220565212851",
  appId: "1:220565212851:web:3f4a151ba4e3470e41aac6",
};

const app = initializeApp(firebaseConfig);

// **THIS PART IS CRITICAL**
export const auth = getAuth(app);
export const db = getFirestore(app);
