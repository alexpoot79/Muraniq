import type { NextConfig } from "next";
import { fixtureDataset } from "./fixtures/dataset";

const isDev = process.env.NODE_ENV !== "production";
const isPreview = process.env.VERCEL_ENV === "preview";
const indexable = process.env.SITE_INDEXABLE === "true" && !isPreview;

/*
 * CSP decision: a STATIC policy (no per-request nonces), so pages can stay
 * prerendered. Next.js injects inline bootstrap scripts, which requires
 * 'unsafe-inline' for scripts without nonces. Everything else is locked to
 * self + the Sanity image CDN. Preview deployments additionally allow the
 * Vercel toolbar. See docs/DECISIONS.md.
 */
const vercelLive = isPreview ? " https://vercel.live" : "";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://cdn.sanity.io${vercelLive} https://vercel.com`,
  "font-src 'self'",
  `connect-src 'self'${vercelLive}${isPreview ? " wss://ws-us3.pusher.com" : ""}${isDev ? " ws:" : ""}`,
  `frame-src ${isPreview ? "https://vercel.live" : "'none'"}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Not indexable until the authorised launch on muraniq.nl (see src/lib/indexing.ts).
  ...(indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 768, 1200, 1800],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Only redirects explicitly activated at migration (G6) are emitted.
    return (fixtureDataset.redirects ?? [])
      .filter((r) => r.active)
      .map((r) => ({ source: r.from, destination: r.to, permanent: true }));
  },
};

export default nextConfig;
