'use client';

import { useState } from 'react';
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

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  return (
    <header className={styles.header}>
      {/* Left side - Logo and menu button */}
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

      {/* Right side - User info */}
      <div className={styles.rightSection}>
        {currentUser ? (
          <div className={styles.userMenu}>
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
                  {currentUser.displayName || currentUser.email}
                </span>
                <span className={styles.userRole}>Người dùng</span>
              </div>
              <ChevronDownIcon className={styles.chevronIcon} />
            </button>

            {userMenuOpen && (
              <div className={styles.userDropdown}>
                <Link href="/profile" className={styles.dropdownItem}>
                  <UserCircleIcon />
                  <span>Hồ sơ</span>
                </Link>
                <Link href="/settings" className={styles.dropdownItem}>
                  <Cog6ToothIcon />
                  <span>Cài đặt</span>
                </Link>
                <div className={styles.dropdownDivider} />
                <button 
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon />
                  <span>Đăng xuất</span>
                </button>
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