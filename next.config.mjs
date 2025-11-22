/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase the body size limit for file uploads (100 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
