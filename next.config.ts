import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Netlify compatibility
  output: process.env.NETLIFY ? 'standalone' : undefined,
  
  // Optimize for serverless
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
};

export default nextConfig;
