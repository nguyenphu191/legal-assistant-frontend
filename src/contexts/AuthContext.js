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
import { uploadToCloudinary, validateImageFile, forceRefreshCloudinaryUrl } from '../utils/cloudinary';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tạo tài liệu người dùng trong Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
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
          ...additionalData
        };
        
        await setDoc(userRef, userData);
        setUserProfile(userData);
        
        console.log('✅ Created user document in Firestore:', user.uid);
      } catch (error) {
        console.error('❌ Lỗi khi tạo tài liệu người dùng:', error);
      }
    }
    
    return userRef;
  };

  // Lấy user profile từ Firestore
  const getUserProfile = async (user) => {
    if (!user) return null;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  };

  // ✨ IMPROVED: Force refresh user data để update UI
  const refreshUserData = async (user) => {
    if (!user) return;
    
    try {
      console.log('🔄 Refreshing user data for UI update');
      
      // Force reload user từ Firebase Auth
      await user.reload();
      
      // Lấy fresh data từ Firestore
      const freshProfile = await getUserProfile(user);
      
      // Trigger re-render bằng cách update state
      setCurrentUser({...user}); // Create new object reference
      
      if (freshProfile) {
        setUserProfile({...freshProfile}); // Create new object reference
      }
      
      console.log('✅ User data refreshed successfully');
      
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    }
  };

  // ✨ IMPROVED: Cập nhật thông tin profile với better state management
  const updateUserProfile = async (updates) => {
    if (!currentUser) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    if (!currentUser.uid || typeof currentUser.getIdToken !== 'function') {
      console.error('❌ Invalid currentUser object:', currentUser);
      throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
    }

    console.log('🚀 updateUserProfile started:', { 
      userId: currentUser.uid,
      updates: Object.keys(updates),
    });

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      let updatedData = { ...updates };
      let newPhotoURL = null;

      // ✨ XỬ LÝ UPLOAD AVATAR VỚI CACHE BUSTING
      if (updates.avatar) {
        const file = updates.avatar;
        
        console.log('📸 Processing avatar upload:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        // Validate file
        const validation = validateImageFile(file, {
          maxSizeBytes: 10 * 1024 * 1024,
          allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        });

        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        try {
          // ✨ UPLOAD VỚI UNIQUE PUBLIC_ID VÀ CACHE BUSTING
          newPhotoURL = await uploadToCloudinary(file, 'avatars', {
            public_id: `user_${currentUser.uid}`,
            tags: 'avatar,profile'
          });

          console.log('✅ Cloudinary upload successful:', newPhotoURL);
          
          // ✨ FORCE REFRESH URL ĐỂ BYPASS CACHE
          const refreshedPhotoURL = forceRefreshCloudinaryUrl(newPhotoURL);
          
          // Update Firebase Auth profile
          await updateProfile(currentUser, { photoURL: refreshedPhotoURL });
          console.log('✅ Updated Firebase Auth profile');
          
          // Set updatedData for Firestore
          updatedData = { ...updates, photoURL: refreshedPhotoURL };
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

      // Update displayName in Firebase Auth if provided
      if (updates.displayName) {
        await updateProfile(currentUser, { 
          displayName: updates.displayName,
          ...(newPhotoURL && { photoURL: newPhotoURL })
        });
        console.log('✅ Updated displayName in Firebase Auth');
      }

      // ✨ UPDATE FIRESTORE VỚI TIMESTAMP
      console.log('📝 Updating Firestore with:', Object.keys(updatedData));
      
      await updateDoc(userRef, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      console.log('✅ Firestore updated successfully');

      // ✨ FORCE REFRESH USER DATA ĐỂ UPDATE UI
      setTimeout(async () => {
        await refreshUserData(currentUser);
        console.log('🔄 UI refreshed with new data');
      }, 500); // Small delay để đảm bảo Firestore đã sync

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
      await updateProfile(user, { displayName: name });
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
      await createUserDocument(user);
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
      await createUserDocument(user);
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
      setUserProfile(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  // ✨ IMPROVED: Auth state listener với better error handling
  useEffect(() => {
    console.log('🎯 Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? `User ${user.uid}` : 'No user');
      
      if (user) {
        try {
          setCurrentUser(user);
          await getUserProfile(user);
          
          if (!userProfile) {
            await createUserDocument(user);
          }
          
          console.log('✅ User setup completed');
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // ✨ IMPROVED: Combined user object với better merging
  const combinedUser = currentUser ? {
    ...currentUser,
    ...(userProfile || {}),
    uid: currentUser.uid,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified,
    displayName: userProfile?.displayName || currentUser.displayName,
    photoURL: userProfile?.photoURL || currentUser.photoURL
  } : null;

  const value = {
    currentUser: combinedUser,
    userProfile,
    register,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateUserProfile,
    refreshUserData, // ✨ NEW: Export refresh function
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #0891b2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>Đang tải...</div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}