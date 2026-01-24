/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // <--- THIS IS THE MISSING KEY
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;