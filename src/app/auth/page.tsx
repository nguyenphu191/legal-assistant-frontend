'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import styles from './auth.module.css';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, loginWithGoogle, loginWithFacebook } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // Trạng thái đăng nhập/đăng ký
  const [showPassword, setShowPassword] = useState(false); // Hiển thị/ẩn mật khẩu
  const [loading, setLoading] = useState(false); // Trạng thái đang tải
  const [error, setError] = useState(''); // Lưu thông báo lỗi
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });

  // Xử lý gửi biểu mẫu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Đăng nhập
        await login(formData.email, formData.password);
        router.push('/chat');
      } else {
        // Đăng ký
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Mật khẩu xác nhận không khớp');
        }
        
        if (formData.password.length < 6) {
          throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
        }

        await register(
          formData.email, 
          formData.password, 
          formData.name,
          formData.company
        );
        router.push('/chat');
      }
    } catch (err: any) {
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
      
      // Xử lý các mã lỗi cụ thể
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Không tìm thấy tài khoản với email này.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không chính xác.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email đã được sử dụng bởi tài khoản khác.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Địa chỉ email không hợp lệ.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
      router.push('/chat');
    } catch (err: any) {
      setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập bằng Facebook
  const handleFacebookLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await loginWithFacebook();
      router.push('/chat');
    } catch (err: any) {
      setError('Không thể đăng nhập bằng Facebook. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <div className={styles.formWrapper}>
          {/* Logo và tiêu đề */}
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <span>AI</span>
            </div>
            <h2 className={styles.title}>
              Trợ lý AI Pháp luật đầu tiên!
            </h2>
            <p className={styles.subtitle}>
              Đăng nhập ngay để bắt đầu khám phá những thông tin hữu ích
            </p>
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <div className={styles.errorMessage}>
              <ExclamationCircleIcon />
              <span>{error}</span>
            </div>
          )}

          {/* Nút đăng nhập mạng xã hội */}
          <div className={styles.socialButtons}>
            <button
              onClick={handleGoogleLogin}
              className={styles.socialButton}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>

            <button
              onClick={handleFacebookLogin}
              className={styles.socialButton}
              disabled={loading}
            >
              <svg fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Đăng nhập với Facebook
            </button>
          </div>

          <div className={styles.divider}>
            <span>Hoặc</span>
          </div>

          {/* Biểu mẫu Email/Mật khẩu */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className={styles.inputField}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            )}

            {!isLogin && (
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Công ty/Tổ chức (không bắt buộc)"
                  className={styles.inputField}
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Nhập địa chỉ email"
                className={styles.inputField}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                className={`${styles.inputField} ${styles.passwordField}`}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className={styles.inputField}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>

          {/* Đăng ký doanh nghiệp */}
          <div className={styles.businessSection}>
            <p className={styles.businessText}>
              Đăng ký AI Tra cứu Luật cho doanh nghiệp?
            </p>
            <button className={styles.businessButton}>
              Đăng ký Doanh nghiệp
            </button>
          </div>

          {/* Điều khoản và chuyển đổi */}
          <div className={styles.footer}>
            <p className={styles.terms}>
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Link href="/terms">
                Chính sách và Điều khoản
              </Link>{' '}
              của AI Tra cứu Luật
            </p>
            
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={styles.switchButton}
              disabled={loading}
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </div>

      {/* Xem trước trò chuyện */}
      <div className={styles.chatPreview}>
        {/* Giữ nội dung xem trước hiện tại */}
      </div>
    </div>
  );
}