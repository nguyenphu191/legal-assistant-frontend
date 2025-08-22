'use client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function SupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      answer: 'AI Tra cứu Luật sử dụng công nghệ trí tuệ nhân tạo để phân tích và tìm kiếm thông tin pháp luật từ cơ sở dữ liệu văn bản pháp luật Việt Nam.'
    },
    {
      question: 'Thông tin từ AI có đáng tin cậy không?',
      answer: 'AI cung cấp thông tin tham khảo dựa trên dữ liệu pháp luật chính thức. Tuy nhiên, bạn nên tham khảo ý kiến chuyên gia pháp lý cho các quyết định quan trọng.'
    },
    {
      question: 'Tôi có thể sử dụng miễn phí không?',
      answer: 'Chúng tôi cung cấp gói miễn phí với giới hạn số lượng truy vấn. Để sử dụng không giới hạn, bạn có thể đăng ký gói trả phí.'
    },
    {
      question: 'Làm sao để nâng cấp tài khoản?',
      answer: 'Bạn có thể nâng cấp tài khoản trong phần Cài đặt hoặc liên hệ với đội ngũ bán hàng qua hotline 19005001.'
    }
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        user={{ name: 'Người dùng' }}
      />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #0891b2 0%, #14b8a6 100%)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <QuestionMarkCircleIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Trung tâm Hỗ trợ
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
              </p>
            </div>

            {/* Support Options */}
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                Liên hệ với chúng tôi
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem' }}>
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={index}
                      style={{
                        background: 'white',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={option.action}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--shadow)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Icon style={{ width: '2.5rem', height: '2.5rem', color: '#0891b2', marginBottom: '1rem' }} />
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {option.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {option.description}
                      </p>
                      <p style={{ color: '#0891b2', fontWeight: '500' }}>
                        {option.contact}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                Câu hỏi thường gặp
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'white',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem',
                      boxShadow: 'var(--shadow)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      {faq.question}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                VIỆN CÔNG NGHỆ BLOCKCHAIN VÀ TRÍ TUỆ NHÂN TẠO ABAII
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Đơn vị phát triển và vận hành hệ thống AI Tra cứu Luật.<br />
                Cam kết mang đến những giải pháp công nghệ tốt nhất cho lĩnh vực pháp lý.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}