import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Lets a device on the LAN load dev-only assets and HMR endpoints. Next
  // blocks cross-origin dev requests by default, which is what triggers
  // "To allow this host in development...". Bare host/IP, no protocol.
  allowedDevOrigins: ["192.168.31.239"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  serverExternalPackages: ["drizzle-kit"],
};

export default nextConfig;
