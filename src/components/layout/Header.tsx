'use client';

// Nhập các hook từ React, điều hướng, và các thành phần cần thiết
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import styles from './Header.module.css';

// Định nghĩa giao diện cho props của thành phần Header
interface HeaderProps {
  onMenuToggle?: () => void;
}

// Thành phần Header của ứng dụng
export default function Header({ onMenuToggle }: HeaderProps) {
  // Lấy thông tin người dùng và hàm đăng xuất từ AuthContext
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  // Quản lý trạng thái hiển thị menu người dùng
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Tham chiếu đến menu để xử lý sự kiện click bên ngoài
  const menuRef = useRef<HTMLDivElement>(null);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  // Xử lý chuyển hướng đến trang đăng nhập
  const handleLogin = () => {
    router.push('/auth');
  };

  // Đóng menu khi nhấp chuột bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Giao diện người dùng của Header
  return (
    <header className={styles.header}>
      {/* Phần bên trái - Logo và nút menu */}
      <div className={styles.leftSection}>
        {onMenuToggle && (
          <button 
            className={styles.menuButton}
            onClick={onMenuToggle}
          >
            <Bars3Icon />
          </button>
        )}
        
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <img src="/logo.png" alt="Logo" className={styles.logoImage} />
          </div>
          <span className={styles.logoText}>Legal Assistant</span>
        </Link>
      </div>

      {/* Phần bên phải - Thông tin người dùng */}
      <div className={styles.rightSection}>
        {currentUser ? (
          <div className={styles.userMenu} ref={menuRef}>
            <button 
              className={styles.userButton}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  className={styles.avatar}
                />
              ) : (
                <UserCircleIcon className={styles.avatarIcon} />
              )}
              
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {currentUser.displayName || 'Người dùng'}
                </span>
                <span className={styles.userRole}>
                  {currentUser.company || 'Người dùng'}
                </span>
              </div>
              
              <ChevronDownIcon className={styles.chevronIcon} />
            </button>

            {/* Menu thả xuống của người dùng */}
            {userMenuOpen && (
              <div className={styles.userDropdown}>
                <div className={styles.userDropdownHeader}>
                  <div className={styles.userDropdownAvatar}>
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Avatar" 
                        className={styles.dropdownAvatarImg}
                      />
                    ) : (
                      <UserCircleIcon className={styles.dropdownAvatarIcon} />
                    )}
                  </div>
                  <div className={styles.userDropdownInfo}>
                    <span className={styles.dropdownUserName}>
                      {currentUser.displayName || 'Người dùng'}
                    </span>
                    <span className={styles.dropdownUserEmail}>
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className={styles.userDropdownDivider}></div>

                <div className={styles.userDropdownMenu}>
                  <Link 
                    href="/profile" 
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <UserCircleIcon className={styles.dropdownIcon} />
                    <span>Thông tin cá nhân</span>
                  </Link>
                  
                  <Link 
                    href="/settings" 
                    className={styles.dropdownItem}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Cog6ToothIcon className={styles.dropdownIcon} />
                    <span>Cài đặt</span>
                  </Link>
                  
                  <div className={styles.userDropdownDivider}></div>
                  
                  <button 
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                  >
                    <ArrowRightOnRectangleIcon className={styles.dropdownIcon} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            className={styles.loginButton}
            onClick={handleLogin}
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}