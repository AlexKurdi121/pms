import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  // output: 'export',
  images: {
    unoptimized: true,      // disables image optimization (needed for static export)
  },
};

export default nextConfig;
