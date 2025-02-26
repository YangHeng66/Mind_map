import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 在构建过程中忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在构建过程中忽略TypeScript错误
    ignoreBuildErrors: true,
  },
  // 禁用跟踪功能
  experimental: {
    disableOptimizedLoading: true,
  }
};

export default nextConfig;
