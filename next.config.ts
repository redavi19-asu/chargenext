const nextConfig = {
  output: "export",
  ...(process.env.NODE_ENV === "production"
    ? {
        basePath: "/chargenext",
        assetPrefix: "/chargenext/",
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
