/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};
console.log("Base path set to %s", nextConfig.basePath);

export default nextConfig;
