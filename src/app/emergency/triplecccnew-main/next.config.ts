import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  ...(isProd
    ? {
        basePath: "/triplecccnew",
        assetPrefix: "/triplecccnew/",
      }
    : {}),
};

export default nextConfig;
