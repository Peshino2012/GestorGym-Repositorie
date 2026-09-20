import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Every page here sits behind a login (or is the login page itself) —
  // nothing in this app should ever render inside someone else's iframe.
  { key: "X-Frame-Options", value: "DENY" },
  // Stops a browser from executing/rendering a response as a different
  // content type than what the server declared (the classic vector: an
  // uploaded "image" that's actually sniffed as HTML/JS and executed).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Cross-origin navigations still send the origin (useful for referral
  // logs) but never the full path/query, which can carry tokens or PII in
  // this app's URLs.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
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
