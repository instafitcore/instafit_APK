import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // Required for Capacitor to find the 'out' folder
  images: {
    unoptimized: true, // Required for static exports
  },
  // Add other Next.js specific options here
};

export default nextConfig;