'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  SparklesIcon,
  ClockIcon,
  UserCircleIcon  // Thêm icon cho Profile
} from '@heroicons/react/24/outline';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    id: 'chat',
    title: 'Chat với AI',
    icon: ChatBubbleLeftRightIcon,
    href: '/chat',
    badge: null
  },
  {
    id: 'conversations',
    title: 'Lịch sử trò chuyện',
    icon: ClockIcon,
    href: '/conversations',
    badge: null
  },
  {
    id: 'documents',
    title: 'Văn bản Pháp Luật',
    icon: DocumentTextIcon,
    href: '/documents',
    badge: 'MỚI'
  },
  {
    id: 'contracts',
    title: 'AI Soạn hợp đồng',
    icon: ClipboardDocumentListIcon,
    href: '/contracts',
    badge: null
  },
  {
    id: 'procedures',
    title: 'Thủ tục hành chính',
    icon: SparklesIcon,
    href: '/procedures',
    badge: 'MỚI'
  },
  {
    id: 'profile',  // Thêm menu Profile
    title: 'Thông tin cá nhân',
    icon: UserCircleIcon,
    href: '/profile',
    badge: null
  },
  {
    id: 'support',
    title: 'Hỗ trợ',
    icon: QuestionMarkCircleIcon,
    href: '/support',
    badge: null
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const handleNewChat = () => {
    // Logic to start new chat conversation
    window.location.href = '/chat';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={styles.sidebarHeader}>
            <button 
              className={styles.newChatButton}
              onClick={handleNewChat}
            >
              <PlusIcon />
              <span>Cuộc trò chuyện mới</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className={styles.navigation}>
            <ul className={styles.navigationList}>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`${styles.navigationLink} ${
                        isActive ? styles.active : ''
                      }`}
                      onClick={onClose}
                    >
                      <div className={styles.linkContent}>
                        <Icon />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className={styles.badge}>{item.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className={styles.sidebarFooter}>
            <div className={styles.footerContent}>
              <div className={styles.hotline}>
                <strong>Hotline: 19008889</strong>
              </div>
              <div className={styles.company}>
                Phát triển bởi<br />
                <strong>HMP Ptit team - Nhóm đồ án Học viện Công nghệ Bưu chính viễn thông</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}