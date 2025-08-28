// src/contexts/AuthContext.js - FIXED COMPATIBILITY VERSION

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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../configs/firebase';
import { uploadToCloudinary, validateImageFile } from '../utils/cloudinary';

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
  const [currentUser, setCurrentUser] = useState(null); // Combined Firebase Auth + Firestore data
  const [userProfile, setUserProfile] = useState(null); // Keep for backward compatibility
  const [loading, setLoading] = useState(true);

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
        const userData = {
          displayName: displayName || additionalData.name || '',
          email,
          photoURL: photoURL || '',
          role: 'user',
          company: additionalData.company || '',
          createdAt,
          updatedAt: createdAt,
          ...additionalData
        };
        
        await setDoc(userRef, userData);
        console.log('✅ Created user document in Firestore:', user.uid);
        return userData;
      } catch (error) {
        console.error('❌ Lỗi khi tạo tài liệu người dùng:', error);
        throw error;
      }
    }
    
    return userDoc.data();
  };

  // Lấy user profile từ Firestore và merge với Firebase Auth data
  const getUserProfile = async (user) => {
    if (!user) return null;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        
        // Merge Firebase Auth data với Firestore data
        const combinedUser = {
          // Firebase Auth properties (keep methods)
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || firestoreData.displayName || '',
          photoURL: user.photoURL || firestoreData.photoURL || '',
          emailVerified: user.emailVerified,
          
          // Firestore properties
          company: firestoreData.company || '',
          role: firestoreData.role || 'user',
          createdAt: firestoreData.createdAt || null,
          updatedAt: firestoreData.updatedAt || null,
          
          // Keep Firebase Auth methods for updateProfile to work
          getIdToken: user.getIdToken?.bind(user),
          reload: user.reload?.bind(user)
        };
        
        return combinedUser;
      } else {
        // Create document if not exists
        const newUserData = await createUserDocument(user);
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
          company: newUserData?.company || '',
          role: newUserData?.role || 'user',
          createdAt: newUserData?.createdAt || new Date(),
          updatedAt: newUserData?.updatedAt || new Date(),
          getIdToken: user.getIdToken?.bind(user),
          reload: user.reload?.bind(user)
        };
      }
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  };

  // **NEW: Refresh user function**
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.log('❌ No Firebase user found during refresh');
        setCurrentUser(null);
        setUserProfile(null);
        return null;
      }

      // Force reload Firebase Auth user to get latest data
      await firebaseUser.reload();
      
      // Get fresh user profile from Firestore
      const freshProfile = await getUserProfile(firebaseUser);
      
      if (freshProfile) {
        console.log('✅ User data refreshed successfully:', {
          photoURL: freshProfile.photoURL,
          displayName: freshProfile.displayName
        });
        
        setCurrentUser(freshProfile);
        setUserProfile(freshProfile); // Keep backward compatibility
        return freshProfile;
      } else {
        console.log('❌ Failed to refresh user profile');
        return null;
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      throw error;
    }
  };

  // Cập nhật thông tin profile người dùng
  const updateUserProfile = async (updates) => {
    const firebaseUser = auth.currentUser; // Get Firebase user directly
    if (!firebaseUser) {
      throw new Error('Người dùng chưa đăng nhập. Vui lòng đăng nhập lại.');
    }

    console.log('🚀 updateUserProfile started:', { 
      userId: firebaseUser.uid,
      updates: Object.keys(updates)
    });

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      let updatedData = { ...updates };

      // Nếu có upload avatar
      if (updates.avatar) {
        const file = updates.avatar;
        
        console.log('📸 Processing avatar upload:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        // Validate file trước khi upload
        const validation = validateImageFile(file, {
          maxSizeBytes: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        });

        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        try {
          // Upload lên Cloudinary
          const photoURL = await uploadToCloudinary(file, 'avatars', {
            public_id: `user_${firebaseUser.uid}`,
            tags: 'avatar,profile'
          });

          console.log('✅ Cloudinary upload successful:', photoURL);
          
          // Cập nhật photoURL trong Firebase Auth
          await updateProfile(firebaseUser, { photoURL });
          console.log('✅ Updated Firebase Auth profile with new photo');
          
          // Thay thế avatar bằng photoURL để lưu vào Firestore
          updatedData = { ...updates, photoURL };
          delete updatedData.avatar;

        } catch (uploadError) {
          console.error('❌ Upload failed:', uploadError);
          
          let errorMessage = 'Lỗi khi upload avatar: ';
          
          if (uploadError.message.includes('Invalid image file')) {
            errorMessage += 'File ảnh không hợp lệ';
          } else if (uploadError.message.includes('File size too large')) {
            errorMessage += 'File quá lớn (tối đa 10MB)';
          } else if (uploadError.message.includes('CLOUDINARY_CLOUD_NAME')) {
            errorMessage += 'Cấu hình Cloudinary không đúng';
          } else {
            errorMessage += uploadError.message || 'Vui lòng thử lại';
          }
          
          throw new Error(errorMessage);
        }
      }

      // Nếu có cập nhật displayName
      if (updates.displayName) {
        await updateProfile(firebaseUser, { displayName: updates.displayName });
        console.log('✅ Updated displayName in Firebase Auth');
      }

      // Cập nhật thông tin trong Firestore
      console.log('📝 Updating Firestore with:', Object.keys(updatedData));
      
      await updateDoc(userRef, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      console.log('✅ Firestore updated successfully');
      console.log('🎉 updateUserProfile completed successfully');

    } catch (error) {
      console.error('❌ Error in updateUserProfile:', error);
      throw error;
    }
  };

  // Đăng ký với email và mật khẩu
  const register = async (email, password, name, company = '') => {
    try {
      console.log('📝 Registering new user:', email);
      
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Cập nhật tên hiển thị
      await updateProfile(user, { displayName: name });
      
      // Tạo tài liệu người dùng trong Firestore
      await createUserDocument(user, { name, company });
      
      console.log('✅ User registration completed');
      return user;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  // Đăng nhập với email và mật khẩu
  const login = async (email, password) => {
    try {
      console.log('🔐 Logging in user:', email);
      
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful');
      
      return user;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // Đăng nhập với Google
  const loginWithGoogle = async () => {
    try {
      console.log('🔐 Google login started');
      
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Kiểm tra xem user đã tồn tại chưa, nếu chưa thì tạo document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await createUserDocument(user);
      }
      
      console.log('✅ Google login successful');
      return user;
    } catch (error) {
      console.error('❌ Google login error:', error);
      throw error;
    }
  };

  // Đăng nhập với Facebook
  const loginWithFacebook = async () => {
    try {
      console.log('🔐 Facebook login started');
      
      const { user } = await signInWithPopup(auth, facebookProvider);
      
      // Kiểm tra xem user đã tồn tại chưa, nếu chưa thì tạo document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await createUserDocument(user);
      }
      
      console.log('✅ Facebook login successful');
      return user;
    } catch (error) {
      console.error('❌ Facebook login error:', error);
      throw error;
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      console.log('👋 Logging out user');
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  // Theo dõi trạng thái xác thực của người dùng
  useEffect(() => {
    console.log('🎯 Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? `User ${user.uid}` : 'No user');
      
      if (user) {
        try {
          setLoading(true);
          
          // Get combined user profile (Firebase Auth + Firestore)
          const combinedUser = await getUserProfile(user);
          
          if (combinedUser) {
            setCurrentUser(combinedUser);
            setUserProfile(combinedUser); // Keep for backward compatibility
            console.log('✅ Combined user profile set successfully');
          } else {
            console.log('❌ Failed to load combined user profile, using Firebase Auth only');
            // Fallback to Firebase Auth user only
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              emailVerified: user.emailVerified,
              company: '',
              role: 'user',
              createdAt: new Date(),
              updatedAt: new Date(),
              getIdToken: user.getIdToken?.bind(user),
              reload: user.reload?.bind(user)
            });
          }
        } catch (error) {
          console.error('❌ Error in auth state change:', error);
          // Fallback to basic user object
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            emailVerified: user.emailVerified,
            company: '',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
            getIdToken: user.getIdToken?.bind(user),
            reload: user.reload?.bind(user)
          });
        }
      } else {
        // Nếu người dùng đăng xuất
        setCurrentUser(null);
        setUserProfile(null);
        console.log('🔄 User signed out, cleared state');
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser, // Now contains combined Firebase Auth + Firestore data
    userProfile, // Keep for backward compatibility
    loading,
    register,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateUserProfile,
    refreshUser, // NEW: Add refreshUser function
    getUserProfile,
    createUserDocument
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}