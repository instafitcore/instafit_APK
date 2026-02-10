/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // This is the most important line
  images: {
    unoptimized: true, // Required for mobile apps
  },
};

export default nextConfig;