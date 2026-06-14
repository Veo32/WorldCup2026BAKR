import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/games',
        destination: 'https://worldcup26.ir/get/games',
      },
    ];
  },
};

export default nextConfig;
