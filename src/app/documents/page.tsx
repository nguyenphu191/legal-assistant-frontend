'use client';

// Nhập các hook từ React và các thành phần, biểu tượng cần thiết
import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import styles from './documents.module.css';

// Định nghĩa giao diện cho danh mục pháp luật
interface LegalCategory {
  id: string;
  name: string;
  count: number;
}

// Định nghĩa giao diện cho tài liệu pháp luật
interface LegalDocument {
  id: string;
  title: string;
  type: string;
  publishDate: string;
  effectiveDate: string;
  status: 'active' | 'draft';
}

// Thành phần chính của trang Văn bản
export default function DocumentsPage() {
  // Quản lý trạng thái mở/đóng của thanh bên
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Quản lý giá trị tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  // Quản lý danh mục được chọn
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Danh sách các danh mục pháp luật
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
    { id: 'technology', name: 'Công nghệ thông tin', count: 14708 }
  ];

  // Danh sách tài liệu pháp luật mẫu
  const mockDocuments: LegalDocument[] = [
    {
      id: '1',
      title: 'Luật Lao động số 45/2019/QH14',
      type: 'Luật',
      publishDate: '2019-11-20',
      effectiveDate: '2021-01-01',
      status: 'active'
    },
    {
      id: '2', 
      title: 'Nghị định về bảo hiểm xã hội số 146/2018/NĐ-CP',
      type: 'Nghị định',
      publishDate: '2018-10-17',
      effectiveDate: '2019-01-01',
      status: 'active'
    },
    {
      id: '3',
      title: 'Thông tư hướng dẫn thực hiện Luật Doanh nghiệp',
      type: 'Thông tư',
      publishDate: '2020-12-15', 
      effectiveDate: '2021-02-01',
      status: 'active'
    }
  ];

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Triển khai logic tìm kiếm
    console.log('Đang tìm kiếm:', searchQuery);
  };

  // Giao diện người dùng của trang Văn bản
  return (
    <ProtectedRoute>
      <div className={styles.documentsContainer}>
        {/* Thanh tiêu đề */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={styles.documentsLayout}>
          {/* Thanh bên */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          {/* Nội dung chính */}
          <main className={styles.mainContent}>
            <div className={styles.contentHeader}>
              <h1 className={styles.pageTitle}>Văn bản Pháp luật</h1>
              <p className={styles.pageDescription}>
                Tra cứu và tìm hiểu các văn bản pháp luật Việt Nam
              </p>
            </div>

            {/* Khu vực tìm kiếm và bộ lọc */}
            <div className={styles.searchSection}>
              <form className={styles.searchForm} onSubmit={handleSearch}>
                <div className={styles.searchInputGroup}>
                  <MagnifyingGlassIcon className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm văn bản pháp luật..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className={styles.searchButton}>
                  Tìm kiếm
                </button>
              </form>

              <div className={styles.filterButtons}>
                <button className={styles.filterButton}>
                  <CalendarIcon />
                  <span>Thời gian</span>
                </button>
                <button className={styles.filterButton}>
                  <AdjustmentsHorizontalIcon />
                  <span>Bộ lọc</span>
                </button>
              </div>
            </div>

            <div className={styles.contentGrid}>
              {/* Khu vực danh mục */}
              <div className={styles.categoriesSection}>
                <h3 className={styles.categoriesTitle}>Lĩnh vực</h3>
                <div className={styles.categoriesList}>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`${styles.categoryItem} ${
                        selectedCategory === category.id ? styles.active : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className={styles.categoryName}>{category.name}</span>
                      <span className={styles.categoryCount}>
                        {category.count.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách tài liệu */}
              <div className={styles.documentsSection}>
                <div className={styles.resultsHeader}>
                  <h3>Kết quả tìm kiếm</h3>
                  <p>{mockDocuments.length} văn bản</p>
                </div>

                <div className={styles.documentsList}>
                  {mockDocuments.map((doc) => (
                    <div key={doc.id} className={styles.documentCard}>
                      <div className={styles.documentHeader}>
                        <DocumentTextIcon className={styles.documentIcon} />
                        <div className={styles.documentMeta}>
                          <span className={styles.documentType}>{doc.type}</span>
                          <span className={styles.documentStatus}>
                            {doc.status === 'active' ? 'Còn hiệu lực' : 'Dự thảo'}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className={styles.documentTitle}>{doc.title}</h4>
                      
                      <div className={styles.documentFooter}>
                        <div className={styles.documentDates}>
                          <span>Ban hành: {doc.publishDate}</span>
                          <span>Hiệu lực: {doc.effectiveDate}</span>
                        </div>
                        <button className={styles.viewButton}>
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}