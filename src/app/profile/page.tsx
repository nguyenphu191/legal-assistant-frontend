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
  const { currentUser, updateUserProfile, loading } = useAuth();
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
        company: currentUser.company || '',
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
      company: currentUser?.company
    });
  }, [currentUser]);

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
      setSuccess('🎉 Cập nhật avatar thành công!');
      console.log('✅ Upload completed successfully');
      
      // Tự động ẩn thông báo success sau 5 giây
      setTimeout(() => {
        setSuccess('');
      }, 5000);

    } catch (error: any) {
      console.error('❌ Upload avatar error:', error);
      
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
        errorMessage = `❌ ${error.message || 'Lỗi không xác định. Vui lòng thử lại'}`;
      }
      
      setError(errorMessage);
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
      
      // Cleanup preview URL
      setTimeout(() => {
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl);
          setPreviewUrl('');
        }
      }, 1000);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.displayName.trim()) {
      setError('📝 Tên hiển thị không được để trống');
      return;
    }

    // Kiểm tra nếu không có thay đổi nào
    const hasChanges = 
      formData.displayName.trim() !== (currentUser?.displayName || '') ||
      formData.company.trim() !== (currentUser?.company || '');

    if (!hasChanges) {
      setError('ℹ️ Không có thông tin nào được thay đổi');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        company: formData.company.trim()
      });
      
      setSuccess('✅ Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      // Tự động ẩn thông báo success sau 3 giây
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      setError('❌ Lỗi khi cập nhật thông tin: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      displayName: currentUser?.displayName || '',
      company: currentUser?.company || '',
      email: currentUser?.email || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const formatDate = (date: any) => {
    if (!date) return 'Không xác định';
    
    try {
      let dateObject: Date;
      
      if (date.toDate && typeof date.toDate === 'function') {
        // Firestore Timestamp
        dateObject = date.toDate();
      } else if (date instanceof Date) {
        dateObject = date;
      } else if (typeof date === 'string') {
        dateObject = new Date(date);
      } else {
        return 'Không xác định';
      }
      
      return dateObject.toLocaleDateString('vi-VN', {
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

  // Tạo optimized avatar URL với Cloudinary transformations
  const getOptimizedAvatarUrl = (url: string) => {
    if (!url) return '';
    
    return buildCloudinaryUrl(url, {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'auto'
    });
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
                      {currentUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </p>
                    
                    {/* Cloudinary Badge */}
                    {optimizedAvatarUrl && (
                      <div className={styles.cloudinaryBadge}>
                        <PhotoIcon className={styles.cloudinaryIcon} />
                        <span>Powered by Cloudinary</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <div className={styles.formSection}>
                  <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>Thông tin tài khoản</h3>
                    {!isEditing ? (
                      <button
                        className={styles.editButton}
                        onClick={() => setIsEditing(true)}
                      >
                        <PencilIcon className={styles.buttonIcon} />
                        Chỉnh sửa
                      </button>
                    ) : (
                      <div className={styles.editActions}>
                        <button
                          className={styles.cancelButton}
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          <XMarkIcon className={styles.buttonIcon} />
                          Hủy
                        </button>
                        <button
                          className={styles.saveButton}
                          onClick={handleSaveChanges}
                          disabled={saving}
                        >
                          <CheckIcon className={styles.buttonIcon} />
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGrid}>
                    {/* Display Name Field */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tên hiển thị</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className={styles.formInput}
                          placeholder="Nhập tên hiển thị"
                          disabled={saving}
                        />
                      ) : (
                        <div className={styles.formValue}>
                          {currentUser.displayName || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <div className={styles.formValue}>
                        {currentUser.email}
                        <span className={styles.emailNote}>
                          (Không thể thay đổi)
                        </span>
                      </div>
                    </div>

                    {/* Company Field */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Công ty</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className={styles.formInput}
                          placeholder="Nhập tên công ty (tùy chọn)"
                          disabled={saving}
                        />
                      ) : (
                        <div className={styles.formValue}>
                          {currentUser.company || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ngày tạo tài khoản</label>
                      <div className={styles.formValue}>
                        {formatDate(currentUser.createdAt)}
                      </div>
                    </div>

                    {/* Role Field */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Vai trò</label>
                      <div className={styles.formValue}>
                        <span className={`${styles.roleBadge} ${
                          currentUser.role === 'admin' ? styles.roleAdmin : styles.roleUser
                        }`}>
                          {currentUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </span>
                      </div>
                    </div>

                    {/* Email Verified Status */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Trạng thái email</label>
                      <div className={styles.formValue}>
                        <span className={`${styles.statusBadge} ${
                          currentUser.emailVerified ? styles.statusVerified : styles.statusPending
                        }`}>
                          {currentUser.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                        </span>
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