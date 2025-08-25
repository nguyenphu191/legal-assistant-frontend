import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;