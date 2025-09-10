'use client';

// Nhập các hook từ React, điều hướng và các thành phần cần thiết
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import styles from './profile.module.css';

// Định nghĩa giao diện cho dữ liệu biểu mẫu
interface FormData {
  displayName: string;
  company: string;
  email: string;
}

// Thành phần chính của trang Hồ sơ
export default function ProfilePage() {
  // Lấy thông tin người dùng và các hàm cập nhật từ AuthContext
  const { currentUser, updateUserProfile, refreshUserData, loading } = useAuth();
  const router = useRouter();
  // Tham chiếu đến input file để tải ảnh đại diện
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Quản lý trạng thái mở/đóng của thanh bên
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Quản lý trạng thái chỉnh sửa thông tin
  const [isEditing, setIsEditing] = useState(false);
  // Quản lý trạng thái đang tải ảnh
  const [uploading, setUploading] = useState(false);
  // Quản lý trạng thái đang lưu thay đổi
  const [saving, setSaving] = useState(false);
  // Quản lý thông báo lỗi
  const [error, setError] = useState('');
  // Quản lý thông báo thành công
  const [success, setSuccess] = useState('');
  
  // Quản lý dữ liệu biểu mẫu
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    company: '',
    email: ''
  });

  // Cập nhật dữ liệu biểu mẫu khi thông tin người dùng thay đổi
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        company: currentUser.company || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  // Xử lý thay đổi dữ liệu trong các trường nhập liệu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  // Xử lý khi nhấp vào ảnh đại diện để mở chọn file
  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  // Xử lý tải lên ảnh đại diện
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ghi log thông tin file đã chọn
    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Kiểm tra định dạng file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Vui lòng chọn file ảnh hợp lệ: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }

    // Kiểm tra kích thước file (tối đa 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      // Ghi log bắt đầu tải lên
      console.log('Starting upload for user:', currentUser?.uid);
      
      await updateUserProfile({ avatar: file });
      
      setSuccess('Cập nhật avatar thành công!');
      // Ghi log hoàn tất tải lên
      console.log('Upload completed successfully');
      
      setTimeout(() => {
        setSuccess('');
      }, 2000);

    } catch (error: any) {
      // Ghi log lỗi khi tải lên
      console.error('Upload avatar error:', error);
      
      let errorMessage = '';
      
      if (error.message.includes('Người dùng chưa đăng nhập')) {
        errorMessage = 'Vui lòng đăng nhập lại để tiếp tục';
        setTimeout(() => router.push('/auth'), 2000);
      } else if (error.message.includes('File ảnh không hợp lệ')) {
        errorMessage = 'File ảnh không hợp lệ. Vui lòng chọn ảnh khác';
      } else if (error.message.includes('File quá lớn')) {
        errorMessage = 'File quá lớn. Tối đa 10MB';
      } else if (error.message.includes('Cấu hình Cloudinary')) {
        errorMessage = 'Lỗi cấu hình hệ thống. Vui lòng liên hệ admin';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại';
      } else {
        errorMessage = error.message || 'Lỗi không xác định. Vui lòng thử lại';
      }
      
      setError(errorMessage);
      
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Xử lý lưu thay đổi thông tin hồ sơ
  const handleSaveChanges = async () => {
    if (!formData.displayName.trim()) {
      setError('Tên hiển thị không được để trống');
      return;
    }

    // Kiểm tra xem có thay đổi nào trong thông tin
    const hasChanges = 
      formData.displayName.trim() !== (currentUser?.displayName || '') ||
      formData.company.trim() !== (currentUser?.company || '');

    if (!hasChanges) {
      setError('Không có thông tin nào được thay đổi');
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
      
      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error: any) {
      // Ghi log lỗi khi cập nhật thông tin
      console.error('Update profile error:', error);
      setError('Lỗi khi cập nhật thông tin: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setSaving(false);
    }
  };

  // Xử lý hủy chỉnh sửa
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

  // Định dạng ngày tháng
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
      // Ghi log lỗi định dạng ngày
      console.error('Format date error:', error);
      return 'Không xác định';
    }
  };

  // Hiển thị màn hình đang tải
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  // Trả về null nếu không có người dùng
  if (!currentUser) {
    return null;
  }

  // Giao diện người dùng của trang Hồ sơ
  return (
    <ProtectedRoute>
      <div className={styles.pageContainer}>
        {/* Thanh tiêu đề */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={styles.mainContent}>
          {/* Thanh bên */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className={styles.content}>
            <div className={styles.container}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Thông tin cá nhân</h1>
                <p className={styles.pageDescription}>
                  Quản lý thông tin tài khoản và cài đặt của bạn
                </p>
              </div>

              {/* Thông báo lỗi */}
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

              {/* Thông báo thành công */}
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
                {/* Khu vực ảnh đại diện */}
                <div className={styles.avatarSection}>
                  <div 
                    className={`${styles.avatarContainer} ${uploading ? styles.uploading : ''}`}
                    onClick={handleAvatarClick}
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL}
                        alt="Avatar" 
                        className={styles.avatar}
                        style={{ opacity: uploading ? 0.7 : 1 }}
                        key={currentUser.photoURL}
                        onError={(e) => {
                          // Ghi log lỗi khi tải ảnh đại diện
                          console.error('Avatar load error:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <UserCircleIcon className={styles.defaultAvatar} />
                    )}
                    
                    <div className={styles.avatarOverlay}>
                      {uploading ? (
                        <div className={styles.uploadProgress}>
                          <div className={styles.spinner}></div>
                          <span className={styles.progressText}>Đang tải...</span>
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
                  </div>
                </div>
              
                {/* Khu vực thông tin người dùng */}
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
                    {/* Tên hiển thị */}
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

                    {/* Công ty */}
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

                    {/* Email (chỉ đọc) */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Email</label>
                      <div className={styles.fieldValue}>
                        {currentUser.email}
                        {currentUser.emailVerified ? (
                          <span className={styles.verifiedBadge}>Đã xác thực</span>
                        ) : (
                          <span className={styles.unverifiedBadge}>Chưa xác thực</span>
                        )}
                      </div>
                    </div>

                    {/* Các nút hành động khi chỉnh sửa */}
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

                {/* Thống kê tài khoản */}
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
