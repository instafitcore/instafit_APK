/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // This creates the 'out' folder
  trailingSlash: true,   // This helps the app find pages on Android
  images: {
    unoptimized: true,   // Mobile apps can't use Next.js's image resizer
  },
};

export default nextConfig;