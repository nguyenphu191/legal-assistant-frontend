'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';
import { 
  SparklesIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import styles from './procedures.module.css';

export default function ProceduresPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const features = [
    'Hướng dẫn thủ tục đăng ký doanh nghiệp',
    'Thủ tục xin giấy phép kinh doanh',
    'Hướng dẫn kê khai thuế',
    'Thủ tục đăng ký bảo hiểm xã hội',
    'Hướng dẫn thủ tục hành chính công',
    'Tra cứu tiến độ xử lý hồ sơ'
  ];

  return (
    <ProtectedRoute>
      <div className={styles.proceduresContainer}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
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
                Tính năng hướng dẫn thủ tục hành chính đang được phát triển để giúp bạn 
                thực hiện các thủ tục một cách dễ dàng và nhanh chóng nhất.
              </p>

              <div className={styles.features}>
                <h3 className={styles.featuresTitle}>Tính năng sắp ra mắt:</h3>
                <div className={styles.featuresList}>
                  {features.map((feature, index) => (
                    <div key={index} className={styles.feature}>
                      <CheckCircleIcon className={styles.featureIcon} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
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
    </ProtectedRoute>
  );
}