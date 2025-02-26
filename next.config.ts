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
};

export default nextConfig;
