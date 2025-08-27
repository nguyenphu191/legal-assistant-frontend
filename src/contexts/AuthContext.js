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
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth User object
  const [userProfile, setUserProfile] = useState(null); // Firestore user data
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
          ...additionalData
        };
        
        await setDoc(userRef, userData);
        setUserProfile(userData); // Set user profile data
        
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

  // Cập nhật thông tin profile người dùng
  const updateUserProfile = async (updates) => {
    if (!currentUser) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    // Kiểm tra currentUser có phải là Firebase User object hợp lệ
    if (!currentUser.uid || typeof currentUser.getIdToken !== 'function') {
      console.error('❌ Invalid currentUser object:', currentUser);
      throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
    }

    console.log('🚀 updateUserProfile started:', { 
      userId: currentUser.uid,
      updates: Object.keys(updates),
      userType: typeof currentUser,
      hasGetIdToken: typeof currentUser.getIdToken === 'function'
    });

    try {
      const userRef = doc(db, 'users', currentUser.uid);
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
            public_id: `user_${currentUser.uid}`,
            tags: 'avatar,profile'
          });

          console.log('✅ Cloudinary upload successful:', photoURL);
          
          // Cập nhật photoURL trong Firebase Auth - sử dụng currentUser trực tiếp
          await updateProfile(currentUser, { photoURL });
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
        await updateProfile(currentUser, { displayName: updates.displayName });
        console.log('✅ Updated displayName in Firebase Auth');
      }

      // Cập nhật thông tin trong Firestore
      console.log('📝 Updating Firestore with:', Object.keys(updatedData));
      
      await updateDoc(userRef, {
        ...updatedData,
        updatedAt: new Date()
      });
      
      console.log('✅ Firestore updated successfully');

      // Cập nhật userProfile state
      const updatedProfile = await getUserProfile(currentUser);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }

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
      setUserProfile(null); // Clear user profile
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
          // Set currentUser to Firebase Auth User object (giữ nguyên methods)
          setCurrentUser(user);
          
          // Lấy profile data từ Firestore riêng
          await getUserProfile(user);
          
          // Tạo document nếu chưa có
          if (!userProfile) {
            await createUserDocument(user);
          }
          
          console.log('✅ User setup completed');
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          setCurrentUser(user); // Fallback to Firebase Auth user
        }
      } else {
        // Nếu người dùng đăng xuất
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

  // Tạo combined user object cho component sử dụng
  const combinedUser = currentUser ? {
    // Firebase Auth properties (giữ nguyên methods)
    ...currentUser,
    // Firestore properties (override các properties trùng tên)
    ...(userProfile || {}),
    // Đảm bảo các properties quan trọng từ Firebase Auth
    uid: currentUser.uid,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified,
    // Thêm properties từ userProfile nếu có
    displayName: userProfile?.displayName || currentUser.displayName,
    photoURL: userProfile?.photoURL || currentUser.photoURL
  } : null;

  const value = {
    currentUser: combinedUser, // Combined user object
    userProfile,               // Firestore data riêng
    register,                  // Hàm đăng ký
    login,                     // Hàm đăng nhập bằng email
    loginWithGoogle,           // Hàm đăng nhập bằng Google
    loginWithFacebook,         // Hàm đăng nhập bằng Facebook
    logout,                    // Hàm đăng xuất
    updateUserProfile,         // Hàm cập nhật profile
    loading                    // Trạng thái tải dữ liệu
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