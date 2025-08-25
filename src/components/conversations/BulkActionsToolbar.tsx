'use client';

import {
  TrashIcon,
  HeartIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import styles from './BulkActionsToolbar.module.css';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkFavorite: () => void;
  onClose: () => void;
  totalCount: number;
  allSelected: boolean;
}

export default function BulkActionsToolbar({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkFavorite,
  onClose,
  totalCount,
  allSelected
}: BulkActionsToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.leftSection}>
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          <XMarkIcon />
        </button>
        
        <div className={styles.selectionInfo}>
          <span className={styles.selectedCount}>
            {selectedCount} đã chọn
          </span>
          
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className={styles.selectAllButton}
          >
            {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={onBulkFavorite}
          className={`${styles.actionButton} ${styles.favoriteButton}`}
          disabled={selectedCount === 0}
        >
          <HeartIcon />
          <span>Yêu thích</span>
        </button>

        <button
          onClick={onBulkDelete}
          className={`${styles.actionButton} ${styles.deleteButton}`}
          disabled={selectedCount === 0}
        >
          <TrashIcon />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
}