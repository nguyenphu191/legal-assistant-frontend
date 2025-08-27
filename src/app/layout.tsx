import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConversationsProvider } from '@/contexts/ConversationsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Tra cứu Luật',
  description: 'Trợ lý AI Pháp luật đầu tiên tại Việt Nam',
  keywords: 'AI, pháp luật, tra cứu, luật, văn bản pháp luật',
  authors: [{ name: 'VIỆN CÔNG NGHỆ BLOCKCHAIN VÀ TRÍ TUỆ NHÂN TẠO ABAII' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ConversationsProvider>
            {children}
          </ConversationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}