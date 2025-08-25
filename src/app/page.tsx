import Link from 'next/link';
import { 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import styles from './home.module.css';

export default function HomePage() {
  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Chat với AI',
      description: 'Trò chuyện trực tiếp với AI để giải đáp thắc mắc pháp lý',
      href: '/chat'
    },
    {
      icon: DocumentTextIcon,
      title: 'Tra cứu Văn bản',
      description: 'Tìm kiếm nhanh chóng trong kho văn bản pháp luật',
      href: '/documents'
    },
    {
      icon: ClipboardDocumentListIcon,
      title: 'Soạn Hợp đồng',
      description: 'AI hỗ trợ soạn thảo các loại hợp đồng phổ biến',
      href: '/contracts'
    },
    {
      icon: SparklesIcon,
      title: 'Thủ tục hành chính',
      description: 'Hướng dẫn các thủ tục cần thiết một cách dễ hiểu',
      href: '/procedures'
    }
  ];

  const benefits = [
    'Tra cứu hơn 355,000 văn bản pháp luật',
    'AI thông minh với khả năng phân tích sâu',
    'Cập nhật liên tục các văn bản mới nhất',
    'Giao diện thân thiện, dễ sử dụng',
    'Hỗ trợ 24/7 không gián đoạn',
    'Bảo mật thông tin người dùng tối đa'
  ];

  return (
    <div className={styles.homePage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <span>AI</span>
            </div>
            <span className={styles.logoText}>AI Tra cứu Luật</span>
          </Link>
          
          <nav className={styles.nav}>
            <Link href="/documents">Văn bản</Link>
            <Link href="/support">Hỗ trợ</Link>
            <Link href="/auth" className={styles.loginButton}>
              Đăng nhập
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Trợ lý AI Pháp luật<br />
              <span className={styles.gradient}>đầu tiên</span> tại Việt Nam
            </h1>
            
            <p className={styles.heroDescription}>
              Khám phá sức mạnh của trí tuệ nhân tạo trong việc tra cứu pháp luật, 
              soạn thảo hợp đồng và giải đáp các thắc mắc pháp lý một cách chính xác và nhanh chóng.
            </p>

            <div className={styles.heroActions}>
              <Link href="/auth" className={styles.ctaButton}>
                Bắt đầu ngay
                <ArrowRightIcon />
              </Link>
              <Link href="/documents" className={styles.secondaryButton}>
                Xem văn bản
              </Link>
            </div>
          </div>

          <div className={styles.heroImage}>
            <div className={styles.chatPreview}>
              <div className={styles.chatHeader}>
                <div className={styles.chatAvatar}>AI</div>
                <div>
                  <div className={styles.chatName}>AI Tra cứu Luật</div>
                  <div className={styles.chatStatus}>Đang hoạt động</div>
                </div>
              </div>
              <div className={styles.chatMessages}>
                <div className={styles.chatMessage}>
                  <div className={styles.messageContent}>
                    Xin chào! Tôi có thể giúp bạn tra cứu thông tin pháp luật. 
                    Bạn có câu hỏi gì cần hỗ trợ không?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Tính năng nổi bật</h2>
            <p>Khám phá các công cụ mạnh mẽ giúp bạn làm việc hiệu quả hơn</p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} href={feature.href} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Icon />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.container}>
          <div className={styles.benefitsContent}>
            <div className={styles.benefitsText}>
              <h2>Tại sao chọn AI Tra cứu Luật?</h2>
              <div className={styles.benefitsList}>
                {benefits.map((benefit, index) => (
                  <div key={index} className={styles.benefitItem}>
                    <CheckCircleIcon className={styles.checkIcon} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth" className={styles.benefitsButton}>
                Trải nghiệm ngay
              </Link>
            </div>
            <div className={styles.benefitsImage}>
              <div className={styles.statsCard}>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>355K+</div>
                  <div className={styles.statLabel}>Văn bản pháp luật</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>24/7</div>
                  <div className={styles.statLabel}>Hỗ trợ không gián đoạn</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statNumber}>99.9%</div>
                  <div className={styles.statLabel}>Độ chính xác</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <div className={styles.logoIcon}>
                  <span>AI</span>
                </div>
                <span>AI Tra cứu Luật</span>
              </div>
              <p>Trợ lý AI Pháp luật đầu tiên tại Việt Nam</p>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Sản phẩm</h4>
                <Link href="/chat">Chat AI</Link>
                <Link href="/documents">Văn bản</Link>
                <Link href="/contracts">Hợp đồng</Link>
              </div>
              <div className={styles.footerColumn}>
                <h4>Hỗ trợ</h4>
                <Link href="/support">Trung tâm hỗ trợ</Link>
                <Link href="/contact">Liên hệ</Link>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p>&copy; 2024 VIỆN CÔNG NGHỆ BLOCKCHAIN VÀ TRÍ TUỆ NHÂN TẠO ABAII. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}