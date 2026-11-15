import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Origins a deployment needs beyond the app itself (a CDN's analytics beacon,
// for example), space-separated, read at build time: they are appended to the
// script-src and connect-src of the Content Security Policy below.
const extraHosts = (process.env.CSP_EXTRA_HOSTS ?? "").split(/\s+/).filter(Boolean);
const withExtra = (sources: string) => [sources, ...extraHosts].join(" ");

// Enforced since 1.2 (CSP_REPORT_ONLY=1 at build time ships it report-only, so a
// deployment can watch the browser console before enforcing). Inline scripts
// and styles stay allowed because the prerendered pages carry Next's hydration
// script inline and React sets style attributes; a stricter script-src means
// hashing those scripts at build time (SECURITY.md). The dev server also needs
// eval for Fast Refresh and source maps, so it alone gets 'unsafe-eval'.
const reportOnly = /^(1|true)$/i.test(process.env.CSP_REPORT_ONLY ?? "");
const contentSecurityPolicy = (dev: boolean) =>
  [
    "default-src 'self'",
    withExtra(
      dev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
    ),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:", // the photo and employer logos may be URLs
    "font-src 'self'",
    withExtra("connect-src 'self'"),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

const securityHeaders = (dev: boolean) => [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy",
    value: contentSecurityPolicy(dev),
  },
];

const nextConfig = (phase: string): NextConfig => ({
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
    return [{ source: "/(.*)", headers: securityHeaders(phase === PHASE_DEVELOPMENT_SERVER) }];
  },
});

export default nextConfig;
