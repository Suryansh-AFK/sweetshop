import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhVlojHuaqGdp8ely34xpYoZppOK20-q4",
  authDomain: "sweetshop-28c40.firebaseapp.com",
  projectId: "sweetshop-28c40",
  storageBucket: "sweetshop-28c40.firebasestorage.app",
  messagingSenderId: "544192555908",
  appId: "1:544192555908:web:95990e7319c9c55e1ecbd1",
  measurementId: "G-RPSQFYX9L1"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
