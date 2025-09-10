'use client';

// Nhập các thành phần và hook cần thiết từ React và Next.js
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
  UserCircleIcon  
} from '@heroicons/react/24/outline';
import styles from './Sidebar.module.css';

// Định nghĩa giao diện cho props của thành phần Sidebar
interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

// Danh sách các mục điều hướng
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
    id: 'profile',  
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

// Thành phần Sidebar của ứng dụng
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Lấy đường dẫn hiện tại
  const pathname = usePathname();
  // Lấy thông tin người dùng từ AuthContext
  const { currentUser } = useAuth();

  // Xử lý tạo cuộc trò chuyện mới
  const handleNewChat = () => {
    // Logic để bắt đầu một cuộc trò chuyện mới
    window.location.href = '/chat';
  };

  // Giao diện người dùng của Sidebar
  return (
    <>
      {/* Lớp phủ cho giao diện mobile */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* Thanh bên */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className="flex flex-col h-full">
          {/* Phần đầu Sidebar */}
          <div className={styles.sidebarHeader}>
            <button 
              className={styles.newChatButton}
              onClick={handleNewChat}
            >
              <PlusIcon />
              <span>Cuộc trò chuyện mới</span>
            </button>
          </div>

          {/* Điều hướng */}
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

          {/* Phần chân Sidebar */}
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
