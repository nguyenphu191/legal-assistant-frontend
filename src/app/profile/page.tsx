'use client';

import { useState, useRef } from 'react';
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { currentUser, updateUserProfile, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    company: currentUser?.company || '',
    email: currentUser?.email || ''
  });

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
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      await updateUserProfile({ avatar: file });
      setSuccess('Cập nhật avatar thành công!');
    } catch (error: any) {
      setError('Lỗi khi cập nhật avatar: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.displayName.trim()) {
      setError('Tên hiển thị không được để trống');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        company: formData.company.trim()
      });
      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error: any) {
      setError('Lỗi khi cập nhật thông tin: ' + (error.message || 'Vui lòng thử lại'));
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

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
                </div>
              )}

              {success && (
                <div className={styles.alertSuccess}>
                  <CheckIcon className={styles.alertIcon} />
                  <span>{success}</span>
                </div>
              )}

              <div className={styles.profileCard}>
                {/* Avatar Section */}
                <div className={styles.avatarSection}>
                  <div className={styles.avatarContainer} onClick={handleAvatarClick}>
                    {currentUser?.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Avatar" 
                        className={styles.avatar}
                      />
                    ) : (
                      <UserCircleIcon className={styles.defaultAvatar} />
                    )}
                    
                    <div className={styles.avatarOverlay}>
                      <CameraIcon className={styles.cameraIcon} />
                      <span className={styles.avatarText}>
                        {uploading ? 'Đang tải...' : 'Đổi ảnh'}
                      </span>
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
                      {currentUser?.displayName || 'Người dùng'}
                    </h2>
                    <p className={styles.userRole}>
                      {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </p>
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
                        />
                      ) : (
                        <div className={styles.formValue}>
                          {currentUser?.displayName || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <div className={styles.formValue}>
                        {currentUser?.email}
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
                        />
                      ) : (
                        <div className={styles.formValue}>
                          {currentUser?.company || 'Chưa cập nhật'}
                        </div>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Ngày tạo tài khoản</label>
                      <div className={styles.formValue}>
                        {currentUser?.createdAt 
                          ? new Date(currentUser.createdAt.toDate()).toLocaleDateString('vi-VN')
                          : 'Không xác định'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className={styles.actionsSection}>
                  <h3 className={styles.formTitle}>Hành động tài khoản</h3>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.secondaryButton}
                      onClick={() => router.push('/auth?mode=change-password')}
                    >
                      Đổi mật khẩu
                    </button>
                    <button 
                      className={styles.dangerButton}
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
                          // Handle delete account
                          console.log('Delete account requested');
                        }
                      }}
                    >
                      Xóa tài khoản
                    </button>
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