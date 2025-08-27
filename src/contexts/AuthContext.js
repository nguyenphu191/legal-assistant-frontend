'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../configs/firebase';

const AuthContext = createContext();

// Hook tùy chỉnh để sử dụng ngữ cảnh xác thực
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // Lưu thông tin người dùng hiện tại
  const [loading, setLoading] = useState(true); // Trạng thái tải (loading)

  // Tạo tài liệu người dùng trong Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    // Nếu người dùng chưa tồn tại trong Firestore thì tạo mới
    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();
      
      try {
        await setDoc(userRef, {
          displayName: displayName || additionalData.name || '',
          email,
          photoURL: photoURL || '',
          role: 'user',
          createdAt,
          ...additionalData
        });
      } catch (error) {
        console.error('Lỗi khi tạo tài liệu người dùng:', error);
      }
    }
    
    return userRef;
  };

  // Đăng ký với email và mật khẩu
  const register = async (email, password, name, company = '') => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Cập nhật tên hiển thị của người dùng
      await updateProfile(user, { displayName: name });
      
      // Tạo tài liệu người dùng trong Firestore
      await createUserDocument(user, { name, company });
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Đăng nhập với email và mật khẩu
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Đăng nhập với Google
  const loginWithGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await createUserDocument(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Đăng nhập với Facebook
  const loginWithFacebook = async () => {
    try {
      const { user } = await signInWithPopup(auth, facebookProvider);
      await createUserDocument(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  // Theo dõi trạng thái xác thực của người dùng
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Lấy dữ liệu người dùng từ Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Nếu có dữ liệu trong Firestore thì kết hợp với thông tin từ Auth
          setCurrentUser({
            ...user,
            ...userDoc.data()
          });
        } else {
          // Nếu chưa có dữ liệu trong Firestore thì chỉ lưu thông tin từ Auth
          setCurrentUser(user);
        }
      } else {
        // Nếu người dùng đăng xuất, reset state về null
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Hủy đăng ký khi component bị unmount
  }, []);

  const value = {
    currentUser,       // Thông tin người dùng hiện tại
    register,          // Hàm đăng ký
    login,             // Hàm đăng nhập bằng email
    loginWithGoogle,   // Hàm đăng nhập bằng Google
    loginWithFacebook, // Hàm đăng nhập bằng Facebook
    logout,            // Hàm đăng xuất
    loading            // Trạng thái tải dữ liệu
  };

  return (
  <AuthContext.Provider value={value}>
    {loading ? <p>Đang tải...</p> : children}
  </AuthContext.Provider>
);
}
