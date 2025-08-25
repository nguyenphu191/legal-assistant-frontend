'use client';

import { useState, useRef, useEffect } from 'react';
import { Conversation } from '@/contexts/ConversationsContext';
import {
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  HeartIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import styles from './ConversationItem.module.css';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onUpdateTitle: (newTitle: string) => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export default function ConversationItem({ 
  conversation, 
  onClick, 
  onDelete,
  onToggleFavorite,
  onUpdateTitle,
  isSelected = false,
  onSelect
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

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
    setIsEditing(true);
    setEditTitle(conversation.title);
    setShowMenu(false);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
    setShowMenu(false);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onUpdateTitle(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(!isSelected);
    }
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
      
      <div 
        className={`${styles.conversationItem} ${isSelected ? styles.selected : ''}`}
        onClick={onClick}
      >
        {/* Selection checkbox for bulk operations */}
        {onSelect && (
          <div className={styles.selectionArea}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectChange}
              className={styles.selectionCheckbox}
            />
          </div>
        )}

        <div className={styles.itemHeader}>
          <div className={styles.iconWrapper}>
            <ChatBubbleLeftRightIcon className={styles.conversationIcon} />
            {conversation.isFavorite && (
              <div className={styles.favoriteIndicator}>
                <HeartSolidIcon className={styles.favoriteIcon} />
              </div>
            )}
          </div>
          
          <div className={styles.itemInfo}>
            {isEditing ? (
              <div className={styles.editTitleContainer}>
                <input
                  ref={editInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSaveTitle}
                  className={styles.editTitleInput}
                  maxLength={100}
                />
                <div className={styles.editActions}>
                  <button
                    onClick={handleSaveTitle}
                    className={`${styles.editAction} ${styles.saveAction}`}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={`${styles.editAction} ${styles.cancelAction}`}
                  >
                    <XMarkIcon />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className={styles.conversationTitle}>{conversation.title}</h3>
                <p className={styles.conversationPreview}>{conversation.preview}</p>
              </>
            )}
          </div>

          {!isEditing && (
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
                    className={styles.menuOption}
                    onClick={handleFavorite}
                  >
                    {conversation.isFavorite ? (
                      <>
                        <HeartSolidIcon />
                        <span>Bỏ yêu thích</span>
                      </>
                    ) : (
                      <>
                        <HeartIcon />
                        <span>Yêu thích</span>
                      </>
                    )}
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
          )}
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
          
          {/* Tags */}
          {conversation.tags && conversation.tags.length > 0 && (
            <div className={styles.tagsContainer}>
              {conversation.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
              {conversation.tags.length > 3 && (
                <span className={styles.moreTagsIndicator}>
                  +{conversation.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
