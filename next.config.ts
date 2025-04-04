import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // 画像ドメインの設定を追加
  images: {
    domains: ['0xmavillain.com'],
  },
};

export default nextConfig;