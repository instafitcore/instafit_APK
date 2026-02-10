/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // If this is missing, the app will crash/go black!
  },
};
export default nextConfig;