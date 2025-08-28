// src/app/profile/page.tsx - SAFE VERSION (Compatible with existing AuthContext)

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { buildCloudinaryUrl } from '@/utils/cloudinary';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import styles from './profile.module.css';

interface FormData {
  displayName: string;
  company: string;
  email: string;
}

export default function ProfilePage() {
  // Safe destructuring - refreshUser might not exist in older AuthContext
  const authContext = useAuth();
  const { currentUser, updateUserProfile, loading } = authContext;
  const refreshUser = (authContext as any).refreshUser; // Safe access
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    company: '',
    email: ''
  });

  // Đồng bộ formData khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        company: (currentUser as any).company || '', // Safe access
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  // Debug log để kiểm tra currentUser
  useEffect(() => {
    console.log('👤 Current User in ProfilePage:', {
      uid: currentUser?.uid,
      email: currentUser?.email,
      displayName: currentUser?.displayName,
      photoURL: currentUser?.photoURL,
      company: (currentUser as any)?.company
    });
  }, [currentUser]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Reset file input để có thể chọn lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Vui lòng chọn file ảnh hợp lệ: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }

    // Validate file size (10MB cho Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 10MB');
      return;
    }

    // Clean up previous preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Tạo preview URL
    const filePreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(filePreviewUrl);

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');
    
    // Simulate progress (Cloudinary không hỗ trợ real-time progress với fetch)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      console.log('🚀 Starting upload for user:', currentUser?.uid);
      
      await updateUserProfile({ avatar: file });
      
      setUploadProgress(100);
      
      // Clear progress interval
      clearInterval(progressInterval);
      
      // IMPORTANT: Clear preview URL để hiển thị ảnh mới từ Cloudinary
      setTimeout(() => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl('');
      }, 1000); // Wait 1 second for upload to complete
      
      // Force refresh user data nếu có function refreshUser
      if (refreshUser && typeof refreshUser === 'function') {
        console.log('🔄 Refreshing user data...');
        try {
          await refreshUser();
        } catch (refreshError) {
          console.warn('⚠️ refreshUser failed, but upload was successful:', refreshError);
        }
      } else {
        console.log('⚠️ refreshUser not available, will rely on auth state change');
        // Force page reload as fallback
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      
      setSuccess('🎉 Cập nhật avatar thành công!');
      console.log('✅ Upload completed successfully');
      
      // Tự động ẩn thông báo success sau 5 giây
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (error: any) {
      console.error('❌ Upload avatar error:', error);
      
      // Clear progress interval on error
      clearInterval(progressInterval);
      
      let errorMessage = '';
      
      // Xử lý các lỗi cụ thể
      if (error.message.includes('Người dùng chưa đăng nhập')) {
        errorMessage = '🔐 Vui lòng đăng nhập lại để tiếp tục';
        // Có thể redirect về trang login
        setTimeout(() => router.push('/auth'), 2000);
      } else if (error.message.includes('File ảnh không hợp lệ')) {
        errorMessage = '📸 File ảnh không hợp lệ. Vui lòng chọn ảnh khác';
      } else if (error.message.includes('File quá lớn')) {
        errorMessage = '📏 File quá lớn. Tối đa 10MB';
      } else if (error.message.includes('Cấu hình Cloudinary')) {
        errorMessage = '⚙️ Lỗi cấu hình hệ thống. Vui lòng liên hệ admin';
      } else if (error.message.includes('Network')) {
        errorMessage = '🌐 Lỗi kết nối. Vui lòng kiểm tra internet và thử lại';
      } else {
        errorMessage = `❌ ${error.message || 'Lỗi không xác định. Vui lòng thử lại.'}`;
      }
      
      setError(errorMessage);
      
      // Clear preview URL on error và hiển thị lại ảnh cũ
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl('');

    } finally {
      setUploading(false);
      setUploadProgress(0);
      clearInterval(progressInterval);
    }
  };

  const handleFormSubmit = async () => {
    if (!currentUser) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updates: any = {};
      
      // Chỉ cập nhật những field đã thay đổi
      if (formData.displayName !== (currentUser.displayName || '')) {
        updates.displayName = formData.displayName.trim();
      }
      
      if (formData.company !== ((currentUser as any).company || '')) {
        updates.company = formData.company.trim();
      }

      // Nếu có thay đổi
      if (Object.keys(updates).length > 0) {
        console.log('🔄 Updating profile:', updates);
        await updateUserProfile(updates);
        
        // Force refresh user data nếu có
        if (refreshUser && typeof refreshUser === 'function') {
          try {
            await refreshUser();
          } catch (refreshError) {
            console.warn('⚠️ refreshUser failed during form update:', refreshError);
          }
        }
        
        setSuccess('✅ Cập nhật thông tin thành công!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setSuccess('ℹ️ Không có thay đổi nào để lưu');
        setTimeout(() => setSuccess(''), 3000);
      }
      
      setIsEditing(false);

    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      setError(`❌ ${error.message || 'Lỗi cập nhật thông tin. Vui lòng thử lại.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form về dữ liệu ban đầu
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        company: (currentUser as any).company || '',
        email: currentUser.email || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // Format date helper
  const formatDate = (date: any) => {
    if (!date) return 'Không xác định';
    
    try {
      // Xử lý Firebase Timestamp
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      
      return dateObj.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Format date error:', error);
      return 'Không xác định';
    }
  };

  // Tạo optimized avatar URL với Cloudinary transformations + timestamp để tránh cache
  const getOptimizedAvatarUrl = (url: string) => {
    if (!url) return '';
    
    try {
      const optimizedUrl = buildCloudinaryUrl(url, {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
        format: 'auto'
      });
      
      // Thêm timestamp để force refresh cache
      const separator = optimizedUrl.includes('?') ? '&' : '?';
      return `${optimizedUrl}${separator}t=${Date.now()}`;
    } catch (error) {
      console.error('Error optimizing avatar URL:', error);
      return url; // Fallback to original URL
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const optimizedAvatarUrl = getOptimizedAvatarUrl(currentUser.photoURL || '');
  const userRole = (currentUser as any)?.role || 'user'; // Safe access
  const createdAt = (currentUser as any)?.createdAt;
  const updatedAt = (currentUser as any)?.updatedAt;

  return (
    <ProtectedRoute>
      <div className={styles.pageContainer}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={styles.mainContent}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className={styles.content}>
            <div className={styles.container}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Thông tin cá nhân</h1>
                <p className={styles.pageDescription}>
                  Quản lý thông tin tài khoản và cài đặt của bạn
                </p>
              </div>

              {/* Alert Messages */}
              {error && (
                <div className={styles.alertError}>
                  <ExclamationTriangleIcon className={styles.alertIcon} />
                  <span>{error}</span>
                  <button 
                    className={styles.alertCloseButton}
                    onClick={() => setError('')}
                  >
                    <XMarkIcon className={styles.alertCloseIcon} />
                  </button>
                </div>
              )}

              {success && (
                <div className={styles.alertSuccess}>
                  <CheckIcon className={styles.alertIcon} />
                  <span>{success}</span>
                  <button 
                    className={styles.alertCloseButton}
                    onClick={() => setSuccess('')}
                  >
                    <XMarkIcon className={styles.alertCloseIcon} />
                  </button>
                </div>
              )}

              <div className={styles.profileCard}>
                {/* Avatar Section */}
                <div className={styles.avatarSection}>
                  <div 
                    className={`${styles.avatarContainer} ${uploading ? styles.uploading : ''}`}
                    onClick={handleAvatarClick}
                    title="Click để đổi avatar"
                  >
                    {previewUrl ? (
                      // Preview ảnh mới
                      <img 
                        src={previewUrl}
                        alt="Preview" 
                        className={styles.avatar}
                      />
                    ) : optimizedAvatarUrl ? (
                      // Ảnh hiện tại từ Cloudinary
                      <img 
                        src={optimizedAvatarUrl}
                        alt="Avatar" 
                        className={styles.avatar}
                        onError={(e) => {
                          console.error('Avatar load error');
                          // Fallback to default icon
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      // Default icon
                      <UserCircleIcon className={styles.defaultAvatar} />
                    )}
                    
                    <div className={styles.avatarOverlay}>
                      {uploading ? (
                        <div className={styles.uploadProgress}>
                          <div className={styles.progressCircle}>
                            <div 
                              className={styles.progressFill}
                              style={{ 
                                background: `conic-gradient(#ffffff ${uploadProgress * 3.6}deg, transparent 0deg)`
                              }}
                            ></div>
                            <span className={styles.progressText}>
                              {Math.round(uploadProgress)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <CameraIcon className={styles.cameraIcon} />
                          <span className={styles.avatarText}>Đổi ảnh</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className={styles.fileInput}
                    disabled={uploading}
                  />
                  
                  <div className={styles.avatarInfo}>
                    <h2 className={styles.userName}>
                      {currentUser.displayName || 'Người dùng'}
                    </h2>
                    <p className={styles.userRole}>
                      {userRole === 'admin' ? '👑 Quản trị viên' : '👤 Người dùng'}
                    </p>
                  </div>
                </div>

                {/* Form Section */}
                <div className={styles.formSection}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="displayName" className={styles.formLabel}>
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        disabled={!isEditing || saving}
                        className={styles.formInput}
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled={true} // Email không được phép thay đổi
                        className={styles.formInput}
                        placeholder="Email"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="company" className={styles.formLabel}>
                        Công ty
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        disabled={!isEditing || saving}
                        className={styles.formInput}
                        placeholder="Nhập tên công ty"
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className={styles.editButton}
                        disabled={uploading}
                      >
                        <PencilIcon className={styles.buttonIcon} />
                        Chỉnh sửa
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleFormSubmit}
                          disabled={saving || uploading}
                          className={styles.saveButton}
                        >
                          <CheckIcon className={styles.buttonIcon} />
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className={styles.cancelButton}
                        >
                          <XMarkIcon className={styles.buttonIcon} />
                          Hủy
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className={styles.additionalInfo}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Ngày tạo tài khoản</div>
                      <div className={styles.infoValue}>
                        {formatDate(createdAt)}
                      </div>
                    </div>
                    
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Lần cập nhật cuối</div>
                      <div className={styles.infoValue}>
                        {formatDate(updatedAt)}
                      </div>
                    </div>
                    
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Trạng thái email</div>
                      <div className={styles.infoValue}>
                        {currentUser.emailVerified ? '✅ Đã xác thực' : '⚠️ Chưa xác thực'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}