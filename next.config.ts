import type { NextConfig } from "next";

// Origins a deployment needs beyond the app itself (a CDN's analytics beacon,
// for example), space-separated, read at build time: they are appended to the
// script-src and connect-src of the Content Security Policy below.
const extraHosts = (process.env.CSP_EXTRA_HOSTS ?? "").split(/\s+/).filter(Boolean);
const withExtra = (sources: string) => [sources, ...extraHosts].join(" ");

// Report-only: the browser logs violations and blocks nothing, so the policy
// can be watched against real traffic before it is enforced. Inline scripts
// and styles stay allowed because the prerendered pages carry Next's hydration
// script inline and React sets style attributes; enforcing the policy means
// hashing those scripts at build time (SECURITY.md).
const contentSecurityPolicy = [
  "default-src 'self'",
  withExtra("script-src 'self' 'unsafe-inline'"),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:", // the photo and employer logos may be URLs
  "font-src 'self'",
  withExtra("connect-src 'self'"),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for the container image (node .next/standalone/server.js).
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
