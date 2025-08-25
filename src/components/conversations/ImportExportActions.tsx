'use client';

import { useRef, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import styles from './ImportExportActions.module.css';

interface ImportExportActionsProps {
  onExport: () => void;
  onImport: (data: string) => boolean;
  conversationCount: number;
}

export default function ImportExportActions({ 
  onExport, 
  onImport, 
  conversationCount 
}: ImportExportActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleExport = () => {
    onExport();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setImportStatus('error');
      setImportMessage('Vui lòng chọn file JSON');
      setTimeout(() => setImportStatus('idle'), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = onImport(content);
        
        if (success) {
          setImportStatus('success');
          setImportMessage('Import thành công!');
        } else {
          setImportStatus('error');
          setImportMessage('File không đúng định dạng');
        }
        
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Lỗi khi đọc file');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <button
          onClick={handleExport}
          className={styles.exportButton}
          disabled={conversationCount === 0}
        >
          <ArrowDownTrayIcon />
          <span>Xuất dữ liệu</span>
          <span className={styles.count}>({conversationCount})</span>
        </button>

        <button
          onClick={handleImportClick}
          className={styles.importButton}
        >
          <ArrowUpTrayIcon />
          <span>Nhập dữ liệu</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
      </div>

      {importStatus !== 'idle' && (
        <div className={`${styles.statusMessage} ${styles[importStatus]}`}>
          {importStatus === 'success' ? (
            <CheckCircleIcon className={styles.statusIcon} />
          ) : (
            <ExclamationTriangleIcon className={styles.statusIcon} />
          )}
          <span>{importMessage}</span>
        </div>
      )}
    </div>
  );
}