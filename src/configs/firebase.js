import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Đã loại bỏ Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyA8xrw8YpD0D6FAflNhLNn09ZhRgXFizkE",
  authDomain: "legal-d147d.firebaseapp.com",
  projectId: "legal-d147d",
  storageBucket: "legal-d147d.firebasestorage.app",
  messagingSenderId: "564284504937",
  appId: "1:564284504937:web:fb3d403537fdae84051bf8",
  measurementId: "G-W1RR2ZMNN7"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Authentication (xác thực người dùng)
export const auth = getAuth(app);

// Khởi tạo Firestore (cơ sở dữ liệu của Firebase)
export const db = getFirestore(app);

// Cấu hình nhà cung cấp dịch vụ đăng nhập
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;