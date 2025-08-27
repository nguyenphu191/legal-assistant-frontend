'use client';

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

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside
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

            {/* User Dropdown Menu */}
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