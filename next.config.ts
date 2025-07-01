import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true, // Electron用
  },
  // Electronビルド時のパス調整
  assetPrefix: process.env.NODE_ENV === 'production' ? '.' : undefined,
  trailingSlash: true,
  // TypeScript厳密チェック
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
