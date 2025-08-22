'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import styles from './auth.module.css';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Redirect to chat page after successful auth
    router.push('/chat');
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
    router.push('/chat');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login');
    router.push('/chat');
  };

  return (
    <div className={styles.authContainer}>
      {/* Left side - Auth form */}
      <div className={styles.authForm}>
        <div className={styles.formWrapper}>
          {/* Logo and title */}
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

          {/* Social login buttons */}
          <div className={styles.socialButtons}>
            <button
              onClick={handleGoogleLogin}
              className={styles.socialButton}
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

          {/* Email/Password form */}
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

            <button type="submit" className={styles.submitButton}>
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          {/* Business registration */}
          <div className={styles.businessSection}>
            <p className={styles.businessText}>
              Đăng ký AI Tra cứu Luật cho doanh nghiệp?
            </p>
            <button className={styles.businessButton}>
              Đăng ký Doanh nghiệp
            </button>
          </div>

          {/* Terms and switch */}
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
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>

            <button className={styles.learnMoreButton}>
              Tìm hiểu thêm
              <ChevronDownIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Chat preview */}
      <div className={styles.chatPreview}>
        <div className={styles.previewOverlay} />
        
        {/* Decorative elements */}
        <div className={styles.decorativeElement1} />
        <div className={styles.decorativeElement2} />
        
        {/* Chat preview */}
        <div className={styles.previewContent}>
          <div className={styles.previewMessages}>
            {/* Chat bubble 1 */}
            <div className={styles.userBubble}>
              <div className={styles.messageHeader}>
                <div className={styles.avatarPlaceholder} />
                <div>
                  <p className={styles.messageText}>
                    Công ty tôi nhập khẩu hàng A, giá CIF theo hợp đồng là 100USD/1 tấn, số lượng 500 sản phẩm, tỷ giá tính thuế là: 22.500đ/USD.
                  </p>
                  <p className={styles.messageQuestion}>
                    Tính thuế nhập khẩu phải nộp?
                  </p>
                </div>
              </div>
            </div>

            {/* Chat bubble 2 */}
            <div className={styles.aiBubble}>
              <div className={styles.aiHeader}>
                <div className={styles.statusIndicator} />
                <span className={styles.aiLabel}>Tính giá trị CIF hàng hóa</span>
              </div>
              <p className={styles.aiText}>
                Giá trị CIF = 100USD/tấn x 500 sản phẩm
              </p>
              <p className={styles.aiAmount}>2.250.000 VND</p>
            </div>

            {/* Additional preview elements */}
            <div className={styles.glassBubble}>
              <div className={styles.stepHeader}>
                <div className={styles.stepIndicator} />
                <span className={styles.stepLabel}>1 bước thuế nhập khẩu</span>
              </div>
              <p className={styles.stepText}>
                Thuế nhập khẩu hóa đơn gì theo thiết bị nhập khẩu của 
                22.250.000 VND/đến = 787.500 VND
              </p>
              <p className={styles.stepAmount}>787.500 VND</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}