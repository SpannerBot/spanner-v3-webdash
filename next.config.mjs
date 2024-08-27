/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.BASE_PATH || "",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
