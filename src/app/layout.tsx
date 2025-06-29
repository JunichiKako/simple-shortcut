import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simple Shortcut',
  description:
    'ローカル開発サーバーやファイルへのショートカットを提供するツール',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
