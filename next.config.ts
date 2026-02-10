/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  output: 'export',     // required for static export
  distDir: 'out',       // outputs files to "out" folder
};

module.exports = nextConfig;
