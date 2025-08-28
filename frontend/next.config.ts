import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: false,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  output: 'standalone',
};

export default nextConfig;
