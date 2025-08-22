'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuToggle?: () => void;
  user?: {
    name: string;
    avatar?: string;
  };
}

export default function Header({ onMenuToggle, user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={styles.header}>
      {/* Left side */}
      <div className={styles.leftSide}>
        <button
          onClick={onMenuToggle}
          className={styles.menuButton}
        >
          <Bars3Icon />
        </button>
        
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <span>AI</span>
          </div>
          <span className={styles.logoText}>TRA CỨU LUẬT</span>
        </Link>
      </div>

      {/* Right side */}
      <div className={styles.rightSide}>
        {/* Notifications */}
        <button className={styles.notificationButton}>
          <BellIcon />
          <span className={styles.notificationBadge}></span>
        </button>

        {/* User menu */}
        <div className={styles.userMenu}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={styles.userMenuButton}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className={styles.userAvatar}
              />
            ) : (
              <UserCircleIcon className={styles.userAvatar} />
            )}
            <span className={styles.userName}>
              {user?.name || 'Người dùng'}
            </span>
            <ChevronDownIcon />
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className={styles.userMenuDropdown}>
              <Link href="/profile">
                Thông tin cá nhân
              </Link>
              <Link href="/settings">
                Cài đặt
              </Link>
              <hr />
              <button
                onClick={() => {
                  // Handle logout
                  console.log('Đăng xuất');
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}