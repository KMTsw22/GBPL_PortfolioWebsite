import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GPBL-5th',
  description: '12명의 멤버 포트폴리오, 이력서, 링크',
  icons: {
    icon: [{ url: '/gpbl-logo.png', type: 'image/png' }],
    shortcut: '/gpbl-logo.png',
    apple: '/gpbl-logo.png',
  },
  openGraph: {
    title: 'GPBL-5th',
    description: 'GPBL 5기 · 12명의 멤버 포트폴리오, 이력서, 링크',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'GPBL-5th',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPBL-5th',
    description: 'GPBL 5기 · 12명의 멤버 포트폴리오, 이력서, 링크',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
