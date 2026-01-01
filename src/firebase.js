// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzXpOg4FpnP1Vp_oo9IifdhcxthV7uUx8",
  authDomain: "oep-enrollment.firebaseapp.com",
  projectId: "oep-enrollment",
  storageBucket: "oep-enrollment.firebasestorage.app",
  messagingSenderId: "997572992786",
  appId: "1:997572992786:web:2978e7c4c06e5a20b09dcb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);