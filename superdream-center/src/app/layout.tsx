import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '超梦 SuperDreams - Control Center',
  description: 'AI Agent Memory Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
