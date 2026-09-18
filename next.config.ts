import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  // Next.js caps Server Action request bodies at 1MB by default — too small
  // for photo uploads (we allow up to 4MB in saveUploadedFile), causing the
  // whole page to crash instead of surfacing our own size-validation error.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
