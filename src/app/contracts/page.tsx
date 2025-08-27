'use client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';
import { 
  ClipboardDocumentListIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import styles from './contracts.module.css';

export default function ContractsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const features = [
    'Soạn thảo hợp đồng mua bán, thuê nhà, lao động',
    'Kiểm tra điều khoản pháp lý trong hợp đồng',
    'Tư vấn về các rủi ro pháp lý',
    'Tạo mẫu hợp đồng theo yêu cầu cụ thể',
    'Hỗ trợ đa ngôn ngữ và định dạng',
    'Tích hợp với cơ sở dữ liệu pháp luật Việt Nam'
  ];

  return (
    <div className={styles.contractsContainer}>
      <Header />

      <div className={styles.contractsLayout}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <main className={styles.mainContent}>
          <div className={styles.comingSoon}>
            <div className={styles.icon}>
              <ClipboardDocumentListIcon />
            </div>
            
            <h1 className={styles.title}>AI Soạn hợp đồng</h1>
            
            <p className={styles.description}>
              Tính năng AI soạn thảo hợp đồng thông minh đang được phát triển để mang đến 
              cho bạn trải nghiệm tốt nhất trong việc tạo và kiểm tra các loại hợp đồng pháp lý.
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
  );
}