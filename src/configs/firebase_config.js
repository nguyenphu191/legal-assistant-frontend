// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8xrw8YpD0D6FAflNhLNn09ZhRgXFizkE",
  authDomain: "legal-d147d.firebaseapp.com",
  projectId: "legal-d147d",
  storageBucket: "legal-d147d.firebasestorage.app",
  messagingSenderId: "564284504937",
  appId: "1:564284504937:web:fb3d403537fdae84051bf8",
  measurementId: "G-W1RR2ZMNN7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);