import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Сурагчийн Туслах Систем',
  description: 'Оюутнуудын аюулгүй байдал, сэтгэлийн эрүүл мэнд өмгөөлөх систем',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
