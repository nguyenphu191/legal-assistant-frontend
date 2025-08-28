'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { buildCloudinaryUrl, forceRefreshCloudinaryUrl } from '@/utils/cloudinary';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import styles from './profile.module.css';

interface FormData {
  displayName: string;
  company: string;
  email: string;
}

export default function ProfilePage() {
  const { currentUser, updateUserProfile, refreshUserData, loading } = useAuth();
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    company: '',
    email: ''
  });

  // ✨ IMPROVED: Đồng bộ formData khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        company: currentUser.company || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  // ✨ IMPROVED: Clean up preview URL khi component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
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

  // ✨ IMPROVED: Clear preview URL properly
  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    // ✨ CLEAR PREVIOUS PREVIEW
    clearPreview();

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

    // ✨ IMPROVED: Create preview URL và lưu file reference
    const filePreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(filePreviewUrl);
    setSelectedFile(file);

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      console.log('🚀 Starting upload for user:', currentUser?.uid);
      
      // ✨ UPLOAD AVATAR VỚI IMPROVED ERROR HANDLING
      await updateUserProfile({ avatar: file });
      
      setUploadProgress(100);
      setSuccess('🎉 Cập nhật avatar thành công!');
      console.log('✅ Upload completed successfully');
      
      // ✨ CLEAR PREVIEW AFTER SUCCESS
      setTimeout(() => {
        clearPreview();
        setSuccess('');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Upload avatar error:', error);
      
      let errorMessage = '';
      
      if (error.message.includes('Người dùng chưa đăng nhập')) {
        errorMessage = '🔐 Vui lòng đăng nhập lại để tiếp tục';
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
      
      // ✨ CLEAR PREVIEW ON ERROR
      setTimeout(() => {
        clearPreview();
      }, 1000);
      
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.displayName.trim()) {
      setError('📝 Tên hiển thị không được để trống');
      return;
    }

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

  // ✨ IMPROVED: Get optimized avatar URL với force refresh
  const getOptimizedAvatarUrl = (url: string) => {
    if (!url) return '';
    
    // Force refresh nếu không có preview
    const refreshedUrl = previewUrl ? url : forceRefreshCloudinaryUrl(url);
    
    return buildCloudinaryUrl(refreshedUrl, {
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

  // ✨ IMPROVED: Avatar URL logic
  const currentAvatarUrl = currentUser.photoURL || '';
  const optimizedAvatarUrl = getOptimizedAvatarUrl(currentAvatarUrl);

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
                {/* ✨ IMPROVED: Avatar Section */}
                <div className={styles.avatarSection}>
                  <div 
                    className={`${styles.avatarContainer} ${uploading ? styles.uploading : ''}`}
                    onClick={handleAvatarClick}
                  >
                    {previewUrl ? (
                      // ✨ PREVIEW ẢNH MỚI
                      <img 
                        src={previewUrl}
                        alt="Preview" 
                        className={styles.avatar}
                        style={{ opacity: uploading ? 0.7 : 1 }}
                      />
                    ) : optimizedAvatarUrl ? (
                      // ✨ ẢNH HIỆN TẠI TỪ CLOUDINARY
                      <img 
                        src={optimizedAvatarUrl}
                        alt="Avatar" 
                        className={styles.avatar}
                        key={currentAvatarUrl} // ✨ FORCE RE-RENDER KHI URL THAY ĐỔI
                        onError={(e) => {
                          console.error('Avatar load error:', e);
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
                          <span className={styles.avatarText}>
                            {previewUrl ? 'Đang tải...' : 'Đổi ảnh'}
                          </span>
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
                      {currentUser.role === 'admin' ? '👑 Quản trị viên' : '👤 Người dùng'}
                    </p>
                  </div>
                </div>

                {/* User Information */}
                <div className={styles.userInfoSection}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>
                    {!isEditing && (
                      <button
                        className={styles.editButton}
                        onClick={() => setIsEditing(true)}
                      >
                        <PencilIcon className={styles.editIcon} />
                        Chỉnh sửa
                      </button>
                    )}
                  </div>

                  <div className={styles.infoFields}>
                    {/* Display Name */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Tên hiển thị</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className={styles.fieldInput}
                          placeholder="Nhập tên hiển thị"
                        />
                      ) : (
                        <div className={styles.fieldValue}>
                          {currentUser.displayName || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>

                    {/* Company */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Công ty</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className={styles.fieldInput}
                          placeholder="Nhập tên công ty"
                        />
                      ) : (
                        <div className={styles.fieldValue}>
                          {currentUser.company || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>

                    {/* Email (readonly) */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Email</label>
                      <div className={styles.fieldValue}>
                        {currentUser.email}
                        {currentUser.emailVerified ? (
                          <span className={styles.verifiedBadge}>✅ Đã xác thực</span>
                        ) : (
                          <span className={styles.unverifiedBadge}>⚠️ Chưa xác thực</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons for editing */}
                    {isEditing && (
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.saveButton}
                          onClick={handleSaveChanges}
                          disabled={saving}
                        >
                          <CheckIcon className={styles.buttonIcon} />
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        
                        <button
                          className={styles.cancelButton}
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          <XMarkIcon className={styles.buttonIcon} />
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Statistics */}
                <div className={styles.statsSection}>
                  <h3 className={styles.sectionTitle}>Thống kê tài khoản</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Ngày tạo tài khoản</div>
                      <div className={styles.statValue}>
                        {formatDate(currentUser.createdAt)}
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Lần cập nhật cuối</div>
                      <div className={styles.statValue}>
                        {formatDate(currentUser.updatedAt)}
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