import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Netlify compatibility
  output: process.env.NETLIFY ? 'standalone' : undefined,
  
  // Optimize for serverless (moved from experimental)
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
