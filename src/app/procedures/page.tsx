'use client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import styles from './procedures.module.css';

export default function ProceduresPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const procedures = [
    {
      icon: '🏢',
      title: 'Đăng ký kinh doanh',
      description: 'Hướng dẫn thành lập doanh nghiệp, đăng ký giấy phép kinh doanh'
    },
    {
      icon: '📄',
      title: 'Thủ tục thuế',
      description: 'Khai báo thuế, đăng ký mã số thuế, quyết toán thuế'
    },
    {
      icon: '🏠',
      title: 'Đăng ký bất động sản',
      description: 'Sang tên sổ đỏ, đăng ký quyền sử dụng đất'
    },
    {
      icon: '🚗',
      title: 'Đăng ký xe cộ',
      description: 'Đăng ký biển số, sang tên đổi chủ phương tiện'
    },
    {
      icon: '👥',
      title: 'Thủ tục lao động',
      description: 'Hợp đồng lao động, bảo hiểm xã hội, sổ lao động'
    },
    {
      icon: '🎓',
      title: 'Thủ tục giáo dục',
      description: 'Chứng nhận tốt nghiệp, bằng cấp, chuyển trường'
    }
  ];

  return (
    <div className={styles.proceduresContainer}>
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        user={{ name: 'Người dùng' }}
      />
      
      <div className={styles.proceduresLayout}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <main className={styles.mainContent}>
          <div className={styles.comingSoon}>
            <div className={styles.icon}>
              <SparklesIcon />
            </div>
            
            <h1 className={styles.title}>Thủ tục hành chính</h1>
            
            <p className={styles.description}>
              AI sẽ hướng dẫn bạn thực hiện các thủ tục hành chính một cách nhanh chóng 
              và chính xác nhất. Tính năng đang trong quá trình hoàn thiện.
            </p>

            <div className={styles.procedures}>
              {procedures.map((procedure, index) => (
                <div key={index} className={styles.procedureCard}>
                  <div className={styles.procedureIcon}>{procedure.icon}</div>
                  <h3 className={styles.procedureTitle}>{procedure.title}</h3>
                  <p className={styles.procedureDescription}>{procedure.description}</p>
                </div>
              ))}
            </div>

            <button 
              className={styles.notifyButton}
              onClick={() => alert('Chúng tôi sẽ thông báo khi tính năng sẵn sàng!')}
            >
              Nhận thông báo khi ra mắt
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}