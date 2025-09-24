// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB84FNO62xeY4iTQzbQrVR_R0zNffqVb68",
  authDomain: "eventmanagement-3acea.firebaseapp.com",
  projectId: "eventmanagement-3acea",
  storageBucket: "eventmanagement-3acea.firebasestorage.app",
  messagingSenderId: "578257490560",
  appId: "1:578257490560:web:22ac1fd101564ac9adcc65",
  measurementId: "G-V2S4WZKL08",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
