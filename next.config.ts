import type { NextConfig } from "next";

// The Content-Security-Policy (with a per-request nonce) is set in middleware.ts.
// Everything is same-origin. No analytics, no CDNs, no third-party anything.

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), bluetooth=(), midi=(), " +
              "accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=(), display-capture=(), screen-wake-lock=(), " +
              "xr-spatial-tracking=(), idle-detection=(), publickey-credentials-get=(), interest-cohort=(), browsing-topics=(), " +
              "attribution-reporting=(), join-ad-interest-group=(), run-ad-auction=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
