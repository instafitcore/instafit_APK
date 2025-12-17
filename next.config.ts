/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "pwjdjqcbleywuekdinqc.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "professionalhomeandofficeservice.water.blog",
      },
      {
        protocol: "https",
        hostname: "cleaningwithlove.ca",
      },
    ],
  },
};

module.exports = nextConfig;