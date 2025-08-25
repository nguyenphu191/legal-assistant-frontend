'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import styles from './support.module.css';

export default function SupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const supportOptions = [
    {
      icon: PhoneIcon,
      title: 'Hotline',
      description: 'Gọi điện thoại để được hỗ trợ trực tiếp',
      contact: '19005001',
      action: () => window.open('tel:19005001')
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      description: 'Gửi email để được hỗ trợ chi tiết',
      contact: 'support@tracuuluat.ai',
      action: () => window.open('mailto:support@tracuuluat.ai')
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Chat trực tiếp với đội ngũ hỗ trợ',
      contact: 'Trực tuyến 24/7',
      action: () => alert('Tính năng chat sẽ sớm ra mắt!')
    }
  ];

  const faqs = [
    {
      question: 'AI Tra cứu Luật hoạt động như thế nào?',
      answer: 'AI Tra cứu Luật sử dụng công nghệ trí tuệ nhân tạo để phân tích và tìm kiếm thông tin pháp luật từ cơ sở dữ liệu văn bản pháp luật Việt Nam. Hệ thống được huấn luyện trên hàng trăm nghìn văn bản pháp luật chính thức.'
    },
    {
      question: 'Thông tin từ AI có đáng tin cậy không?',
      answer: 'AI cung cấp thông tin tham khảo dựa trên dữ liệu pháp luật chính thức từ các cơ quan nhà nước. Tuy nhiên, bạn nên tham khảo ý kiến chuyên gia pháp lý cho các quyết định quan trọng và luôn kiểm tra nguồn gốc của thông tin.'
    },
    {
      question: 'Tôi có thể sử dụng miễn phí không?',
      answer: 'Chúng tôi cung cấp gói miễn phí với giới hạn số lượng truy vấn mỗi ngày. Để sử dụng không giới hạn và truy cập các tính năng nâng cao, bạn có thể đăng ký gói trả phí.'
    },
    {
      question: 'Làm sao để nâng cấp tài khoản?',
      answer: 'Bạn có thể nâng cấp tài khoản trong phần Cài đặt hoặc liên hệ với đội ngũ bán hàng qua hotline 19005001. Chúng tôi có nhiều gói dịch vụ phù hợp với nhu cầu sử dụng khác nhau.'
    },
    {
      question: 'Dữ liệu của tôi có được bảo mật không?',
      answer: 'Chúng tôi cam kết bảo mật thông tin người dùng theo tiêu chuẩn quốc tế. Tất cả dữ liệu được mã hóa và chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba mà không có sự đồng ý của bạn.'
    },
    {
      question: 'Tôi có thể sử dụng trên thiết bị di động không?',
      answer: 'Có, AI Tra cứu Luật hỗ trợ đầy đủ trên các thiết bị di động thông qua trình duyệt web. Chúng tôi cũng đang phát triển ứng dụng di động chuyên dụng sẽ ra mắt trong thời gian tới.'
    }
  ];

  return (
    <ProtectedRoute>
      <div className={styles.supportContainer}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={styles.supportLayout}>
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          <main className={styles.mainContent}>
            <div className={styles.contentHeader}>
              <h1 className={styles.pageTitle}>Trung tâm Hỗ trợ</h1>
              <p className={styles.pageDescription}>
                Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy chọn cách thức liên hệ phù hợp.
              </p>
            </div>

            {/* Support Options */}
            <div className={styles.supportOptions}>
              {supportOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div 
                    key={index} 
                    className={styles.supportCard}
                    onClick={option.action}
                  >
                    <div className={styles.cardIcon}>
                      <Icon />
                    </div>
                    <h3 className={styles.cardTitle}>{option.title}</h3>
                    <p className={styles.cardDescription}>{option.description}</p>
                    <div className={styles.cardContact}>{option.contact}</div>
                  </div>
                );
              })}
            </div>

            {/* FAQ Section */}
            <div className={styles.faqSection}>
              <h2 className={styles.faqTitle}>Câu hỏi thường gặp</h2>
              <div className={styles.faqList}>
                {faqs.map((faq, index) => (
                  <div key={index} className={styles.faqItem}>
                    <button
                      className={styles.faqQuestion}
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDownIcon 
                        className={`${styles.chevronIcon} ${
                          openFaq === index ? styles.chevronOpen : ''
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className={styles.faqAnswer}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}