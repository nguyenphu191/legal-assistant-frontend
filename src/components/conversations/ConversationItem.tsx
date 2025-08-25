'use client';

import { useState } from 'react';
import { Conversation } from '@/contexts/ConversationsContext';
import {
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import styles from './ConversationItem.module.css';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
  onDelete: () => void;
}

export default function ConversationItem({ 
  conversation, 
  onClick, 
  onDelete 
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Hôm nay';
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} tuần trước`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} tháng trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement title editing
    setShowMenu(false);
  };

  return (
    <>
      {/* Overlay to close menu */}
      {showMenu && (
        <div 
          className={styles.menuOverlay}
          onClick={() => setShowMenu(false)}
        />
      )}
      
      <div className={styles.conversationItem} onClick={onClick}>
        <div className={styles.itemHeader}>
          <div className={styles.iconWrapper}>
            <ChatBubbleLeftRightIcon className={styles.conversationIcon} />
          </div>
          
          <div className={styles.itemInfo}>
            <h3 className={styles.conversationTitle}>{conversation.title}</h3>
            <p className={styles.conversationPreview}>{conversation.preview}</p>
          </div>

          <div className={styles.itemActions}>
            <button 
              className={styles.menuButton}
              onClick={handleMenuClick}
            >
              <EllipsisVerticalIcon />
            </button>

            {showMenu && (
              <div className={styles.dropdownMenu}>
                <button 
                  className={styles.menuOption}
                  onClick={handleEdit}
                >
                  <PencilIcon />
                  <span>Đổi tên</span>
                </button>
                <button 
                  className={`${styles.menuOption} ${styles.deleteOption}`}
                  onClick={handleDelete}
                >
                  <TrashIcon />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.itemFooter}>
          <div className={styles.itemMeta}>
            <span className={styles.messageCount}>
              {conversation.messageCount} tin nhắn
            </span>
            <span className={styles.separator}>•</span>
            <span className={styles.lastUpdated}>
              <CalendarIcon />
              {formatDate(conversation.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}