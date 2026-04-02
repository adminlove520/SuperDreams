import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SuperDreams // Control Center',
  description: 'AI Agent Cognitive Memory Management System - Neural Network Operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
