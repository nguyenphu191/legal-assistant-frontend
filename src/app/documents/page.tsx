'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import styles from './documents.module.css';

interface LegalCategory {
  id: string;
  name: string;
  count: number;
}

interface LegalDocument {
  id: string;
  title: string;
  type: string;
  publishDate: string;
  effectiveDate: string;
  status: 'active' | 'draft';
}

const categories: LegalCategory[] = [
  { id: 'all', name: 'Xem tất cả', count: 355703 },
  { id: 'administrative', name: 'Bộ máy hành chính', count: 130529 },
  { id: 'finance', name: 'Tài chính nhà nước', count: 48649 },
  { id: 'culture', name: 'Văn hóa - Xã hội', count: 44008 },
  { id: 'resources', name: 'Tài nguyên - Môi trường', count: 29249 },
  { id: 'real_estate', name: 'Bất động sản', count: 26181 },
  { id: 'commerce', name: 'Thương mại', count: 25083 },
  { id: 'construction', name: 'Xây dựng - Đô thị', count: 24718 },
  { id: 'health', name: 'Thể thao - Y tế', count: 23009 },
  { id: 'education', name: 'Giáo dục', count: 19027 },
  { id: 'tax', name: 'Thuế - Phí - Lệ Phí', count: 18505 },
  { id: 'transport', name: 'Giao thông - Vận tải', count: 17356 },
  { id: 'labor', name: 'Lao động - Tiền lương', count: 16448 },
  { id: 'technology', name: 'Công nghệ thông tin', count: 14708 },
  { id: 'investment', name: 'Đầu tư', count: 14037 },
  { id: 'business', name: 'Doanh nghiệp', count: 12963 },
  { id: 'export', name: 'Xuất nhập khẩu', count: 12075 },
  { id: 'other', name: 'Lĩnh vực khác', count: 9617 },
  { id: 'civil_rights', name: 'Quyền dân sự', count: 6680 },
  { id: 'banking', name: 'Tiền tệ - Ngân hàng', count: 5380 },
  { id: 'legal_services', name: 'Dịch vụ pháp lý', count: 3173 },
  { id: 'insurance', name: 'Bảo hiểm', count: 3047 },
  { id: 'judicial', name: 'Thủ tục Tố tụng', count: 2525 },
  { id: 'violations', name: 'Vi phạm hành chính', count: 2370 },
  { id: 'accounting', name: 'Kế toán - Kiểm toán', count: 1860 }
];

const mockDocuments: LegalDocument[] = [
  {
    id: '1',
    title: 'Nghị quyết 28/NQ-HĐND năm 2024 dự kiến kế hoạch đầu tư công năm 2025 do tỉnh Quảng Nam ban hành',
    type: 'Luộc đổ',
    publishDate: '11/07/2024',
    effectiveDate: '11/07/2024',
    status: 'active'
  },
  {
    id: '2',
    title: 'Nghị quyết 07/2024/NQ-HĐND quy định xét tặng Kỷ niệm chương "Vì sự nghiệp xây dựng và phát triển tỉnh Điện Biên"',
    type: 'Luộc đổ',
    publishDate: '11/07/2024',
    effectiveDate: '01/08/2024',
    status: 'active'
  },
  {
    id: '3',
    title: 'Nghị quyết 22/NQ-HĐND năm 2024 đặt tên, điều chỉnh giới hạn tuyến đường tại thị trấn Trung Phước, huyện Nông Sơn; thị trấn Nam Phước, huyện Duy Xuyên và thành phố Tam Kỳ, tỉnh Quảng Nam',
    type: 'Luộc đổ',
    publishDate: '11/07/2024',
    effectiveDate: '11/07/2024',
    status: 'active'
  },
  {
    id: '4',
    title: 'Nghị quyết 14/2024/NQ-HĐND quy định một số chính sách hỗ trợ xuất bản, phổ biến, tăng thưởng các tác phẩm, công trình văn học, nghệ thuật của văn nghệ sĩ sáng tác và đạt giải thưởng trong 2 năm 2024 và 2025 do tỉnh Bình Định ban hành',
    type: 'Luộc đổ',
    publishDate: '12/07/2024',
    effectiveDate: '22/07/2024',
    status: 'active'
  }
];

export default function DocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const currentPage = 1;
  const totalPages = Math.ceil((selectedCategoryData?.count || 0) / 10);

  return (
    <div className={styles.documentsContainer}>
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        user={{ name: 'Người dùng' }}
      />
      
      <div className={styles.documentsLayout}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Left Sidebar - Categories */}
        <div className={styles.categorySidebar}>
          <div className={styles.sidebarHeader}>
            <button className={styles.backButton}>
              <ArrowLeftIcon />
            </button>
            <h2 className={styles.sidebarTitle}>Tra cứu văn bản</h2>
          </div>

          <div className={styles.categoryList}>
            <div className={styles.categories}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${styles.categoryItem} ${selectedCategory === category.id ? styles.active : ''}`}
                >
                  <span>{category.name}</span>
                  <span className={styles.categoryCount}>
                    ({category.count.toLocaleString()})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Search and Filters */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <div className={styles.searchInput}>
                <MagnifyingGlassIcon />
                <input
                  type="text"
                  placeholder="Tiêu đề, số hiệu, nội dung"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className={styles.searchButton}>
                Tìm kiếm
              </button>
            </div>

            {/* Date filters */}
            <div className={styles.filters}>
              <span className={styles.filterLabel}>Thời gian ban hành:</span>
              <div className={styles.dateInputs}>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={styles.dateInput}
                />
                <span className={styles.dateLabel}>Đến</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={styles.filterButton}
              >
                <AdjustmentsHorizontalIcon />
                <span>Thêm điều kiện</span>
              </button>
              <button className={styles.clearButton}>
                <TrashIcon />
              </button>
              <button className={styles.clearButton}>
                <span className={styles.clearText}>Xóa tất cả</span>
              </button>
            </div>
          </div>

          {/* Results */}
          <div className={styles.resultsSection}>
            <div className={styles.resultsContainer}>
              {/* Results header */}
              <div className={styles.resultsHeader}>
                <div className={styles.resultsInfo}>
                  <h3>Văn bản Pháp luật</h3>
                  <p>
                    Kết quả 1-10 trong {selectedCategoryData?.count.toLocaleString()} văn bản
                  </p>
                </div>
                <div>
                  <a href="#" className={styles.historyLink}>
                    Lịch sử trò chuyện
                  </a>
                </div>
              </div>

              {/* Document list */}
              <div className={styles.documentsList}>
                {mockDocuments.map((doc, index) => (
                  <div key={doc.id} className={styles.documentCard}>
                    <div className={styles.documentContent}>
                      {/* Document number */}
                      <div className={styles.documentNumber}>
                        {index + 1}
                      </div>

                      {/* Document content */}
                      <div className={styles.documentMain}>
                        <h4 className={styles.documentTitle}>
                          {doc.title}
                        </h4>
                        
                        <div className={styles.documentMeta}>
                          <span className={styles.documentType}>
                            {doc.type}
                          </span>
                        </div>
                      </div>

                      {/* Document info */}
                      <div className={styles.documentInfo}>
                        <div>Ban hành: {doc.publishDate}</div>
                        <div>Hiệu lực: {doc.effectiveDate}</div>
                        <div className={styles.documentStatus}>
                          <span className={styles.statusBadge}>
                            Còn hiệu lực
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className={styles.pagination}>
                <button className={styles.paginationButton} disabled>
                  ‹
                </button>
                
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
                
                <span className={styles.paginationEllipsis}>...</span>
                
                <button className={styles.paginationButton}>
                  {totalPages}
                </button>
                
                <button className={styles.paginationButton}>
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}