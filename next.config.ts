/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  output: 'export', // <-- ADD THIS
};

module.exports = nextConfig;
