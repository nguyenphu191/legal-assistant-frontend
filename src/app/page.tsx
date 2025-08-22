'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth page
    router.push('/auth');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          background: 'linear-gradient(135deg, #0891b2 0%, #14b8a6 100%)',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.25rem'
        }}>
          AI
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          AI Tra cứu Luật
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)',
          marginBottom: '1rem'
        }}>
          Đang chuyển hướng...
        </p>
        
        {/* Loading spinner */}
        <div style={{
          margin: '1rem auto',
          width: '2rem',
          height: '2rem',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #0891b2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    </div>
  );
}