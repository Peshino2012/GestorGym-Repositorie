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
  // Forces HTTPS for a year, including subdomains, and opts into browsers'
  // preload lists — this app should never be reachable over plain HTTP.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // No page here needs the camera, microphone, or geolocation — denying
  // them outright means a future XSS/dependency bug can't abuse them even
  // if it gets script execution.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // 'unsafe-inline' on script/style (not a nonce setup) because Next's App
  // Router streams RSC hydration through inline <script> tags — a stricter
  // nonce-based CSP is possible but needs its own careful rollout, not a
  // one-line addition. Even with that relaxation, this still blocks the
  // things that matter most for a login-gated admin panel: loading a
  // THIRD-PARTY script, framing this app in someone else's page, exfiltrating
  // data to an arbitrary origin (connect-src), and hijacking a form's
  // submission target.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://*.public.blob.vercel-storage.com data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
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
