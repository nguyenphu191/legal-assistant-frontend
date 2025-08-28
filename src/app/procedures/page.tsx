'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';
import { 
  DocumentTextIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import styles from './procedures.module.css';

export default function ProceduresPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  // Dữ liệu hard code cho các thủ tục hành chính (sẽ thay bằng API sau)
  const procedures = [
    {
      id: 1,
      name: 'Đăng ký thành lập doanh nghiệp',
      description: 'Thủ tục đăng ký thành lập doanh nghiệp tư nhân hoặc công ty tại Việt Nam.',
      steps: [
        'Chuẩn bị hồ sơ: Giấy đề nghị đăng ký doanh nghiệp, Điều lệ công ty, Danh sách cổ đông sáng lập.',
        'Nộp hồ sơ tại Phòng Đăng ký kinh doanh nơi doanh nghiệp đặt trụ sở chính (trực tiếp hoặc trực tuyến qua Cổng Dịch vụ công).',
        'Nhận Giấy chứng nhận đăng ký doanh nghiệp sau khi được phê duyệt.',
        'Thông báo công khai trên Cổng thông tin quốc gia về đăng ký doanh nghiệp.'
      ],
      documents: [
        'Giấy đề nghị đăng ký doanh nghiệp.',
        'Điều lệ công ty.',
        'Danh sách cổ đông sáng lập (nếu áp dụng).',
        'Bản sao CMND/CCCD/Hộ chiếu của người đại diện.'
      ],
      processingTime: '3-5 ngày làm việc',
      referenceLink: 'https://dangkykinhdoanh.gov.vn'
    },
    {
      id: 2,
      name: 'Xin giấy phép kinh doanh',
      description: 'Thủ tục cấp giấy phép kinh doanh cho tổ chức kinh tế, bao gồm vốn đầu tư nước ngoài.',
      steps: [
        'Chuẩn bị hồ sơ: Đơn đề nghị cấp Giấy phép kinh doanh, Bản sao Giấy chứng nhận đăng ký kinh doanh, Điều lệ công ty.',
        'Nộp hồ sơ tại cơ quan cấp phép (Sở Kế hoạch và Đầu tư hoặc qua Cổng Dịch vụ công).',
        'Kiểm tra và bổ sung nếu cần.',
        'Nhận giấy phép sau khi được phê duyệt.'
      ],
      documents: [
        'Đơn đề nghị cấp Giấy phép kinh doanh.',
        'Bản sao Giấy chứng nhận đăng ký kinh doanh.',
        'Điều lệ công ty.',
        'Giấy chứng nhận đăng ký đầu tư (nếu có vốn nước ngoài).'
      ],
      processingTime: '5-7 ngày làm việc',
      referenceLink: 'https://dichvucong.gov.vn'
    },
    {
      id: 3,
      name: 'Kê khai thuế doanh nghiệp',
      description: 'Hướng dẫn kê khai và nộp thuế thu nhập doanh nghiệp điện tử.',
      steps: [
        'Đăng nhập hệ thống thuế điện tử (eTax hoặc HTKK).',
        'Kê khai thông tin theo mẫu (ví dụ: Mẫu 03/TNDN cho thuế TNDN).',
        'Ký điện tử và nộp tờ khai.',
        'Kiểm tra kết quả và nộp thuế nếu cần.'
      ],
      documents: [
        'Tờ khai thuế TNDN (Mẫu 03/TNDN).',
        'Báo cáo tài chính.',
        'Hóa đơn, chứng từ liên quan.'
      ],
      processingTime: 'Tức thì (nộp trực tuyến)',
      referenceLink: 'https://esign.misa.vn/ke-khai-thue-dien-tu'
    },
    {
      id: 4,
      name: 'Đăng ký bảo hiểm xã hội',
      description: 'Thủ tục đăng ký tham gia bảo hiểm xã hội bắt buộc cho doanh nghiệp và người lao động.',
      steps: [
        'Chuẩn bị hồ sơ: Tờ khai tham gia BHXH, Danh sách lao động tham gia.',
        'Nộp hồ sơ tại cơ quan BHXH (trực tiếp, qua bưu điện, hoặc điện tử).',
        'Đóng tiền BHXH theo quy định.',
        'Nhận sổ BHXH và thẻ BHYT.'
      ],
      documents: [
        'Tờ khai tham gia BHXH (Mẫu TK1-TS).',
        'Danh sách lao động tham gia BHXH.',
        'Bản sao Giấy chứng nhận đăng ký kinh doanh.'
      ],
      processingTime: '7-10 ngày làm việc',
      referenceLink: 'https://dichvucong.gov.vn'
    },
    {
      id: 5,
      name: 'Tra cứu tiến độ xử lý hồ sơ hành chính',
      description: 'Thủ tục tra cứu và theo dõi tiến độ hồ sơ hành chính công.',
      steps: [
        'Truy cập Cổng Dịch vụ công Quốc gia.',
        'Nhập mã hồ sơ hoặc thông tin liên quan.',
        'Xem tiến độ và nhận thông báo.',
        'Bổ sung nếu cần.'
      ],
      documents: [
        'Mã hồ sơ hành chính.',
        'Thông tin cá nhân/doanh nghiệp.'
      ],
      processingTime: 'Tức thì (trực tuyến)',
      referenceLink: 'https://dichvucong.gov.vn'
    }
  ];

  const toggleAccordion = (id: number) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

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
            <div className={styles.proceduresContent}>
              <h1 className={styles.title}>Thủ tục hành chính</h1>
              
              <p className={styles.description}>
                Dưới đây là hướng dẫn chi tiết các thủ tục hành chính phổ biến. Bạn có thể chọn thủ tục để xem hướng dẫn.
              </p>

              <div className={styles.proceduresList}>
                {procedures.map((procedure) => (
                  <div key={procedure.id} className={styles.accordionItem}>
                    <div 
                      className={styles.accordionHeader}
                      onClick={() => toggleAccordion(procedure.id)}
                    >
                      <span>{procedure.name}</span>
                      <ChevronDownIcon 
                        className={`${styles.accordionIcon} ${activeAccordion === procedure.id ? styles.rotate : ''}`} 
                      />
                    </div>
                    
                    {activeAccordion === procedure.id && (
                      <div className={styles.accordionContent}>
                        <p className={styles.procedureDescription}>{procedure.description}</p>
                        
                        <h3 className={styles.subTitle}>Các bước thực hiện:</h3>
                        <ol className={styles.stepsList}>
                          {procedure.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                        
                        <h3 className={styles.subTitle}>Tài liệu cần thiết:</h3>
                        <ul className={styles.documentsList}>
                          {procedure.documents.map((doc, index) => (
                            <li key={index}>
                              <DocumentTextIcon className={styles.documentIcon} />
                              {doc}
                            </li>
                          ))}
                        </ul>
                        
                        <p className={styles.processingTime}>
                          <strong>Thời gian xử lý:</strong> {procedure.processingTime}
                        </p>
                        
                        <a 
                          href={procedure.referenceLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.referenceLink}
                        >
                          Tham khảo chi tiết
                        </a>
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