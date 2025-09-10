'use client';

// Nhập các hook từ React và giao diện Conversation
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

// Định nghĩa giao diện cho props của thành phần ConversationItem
interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onUpdateTitle: (newTitle: string) => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

// Thành phần hiển thị một cuộc trò chuyện trong danh sách
export default function ConversationItem({ 
  conversation, 
  onClick, 
  onDelete,
  onToggleFavorite,
  onUpdateTitle,
  isSelected = false,
  onSelect
}: ConversationItemProps) {
  // Quản lý trạng thái hiển thị menu
  const [showMenu, setShowMenu] = useState(false);
  // Quản lý trạng thái chỉnh sửa tiêu đề
  const [isEditing, setIsEditing] = useState(false);
  // Quản lý giá trị tiêu đề khi chỉnh sửa
  const [editTitle, setEditTitle] = useState(conversation.title);
  // Tham chiếu đến ô nhập liệu chỉnh sửa tiêu đề
  const editInputRef = useRef<HTMLInputElement>(null);

  // Tự động focus và chọn nội dung ô nhập liệu khi chỉnh sửa
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Định dạng ngày tháng cho hiển thị
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

  // Xử lý nhấp vào nút menu
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Xử lý xóa cuộc trò chuyện
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setShowMenu(false);
  };

  // Xử lý bắt đầu chỉnh sửa tiêu đề
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(conversation.title);
    setShowMenu(false);
  };

  // Xử lý chuyển đổi trạng thái yêu thích
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
    setShowMenu(false);
  };

  // Xử lý lưu tiêu đề mới
  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onUpdateTitle(editTitle.trim());
    }
    setIsEditing(false);
  };

  // Xử lý hủy chỉnh sửa tiêu đề
  const handleCancelEdit = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  // Xử lý phím nhấn trong ô nhập liệu
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Xử lý chọn/bỏ chọn cuộc trò chuyện
  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(!isSelected);
    }
  };

  // Giao diện người dùng của thành phần
  return (
    <>
      {/* Lớp phủ để đóng menu */}
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
        {/* Hộp kiểm chọn cho thao tác hàng loạt */}
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
          
          {/* Nhãn (tags) */}
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
