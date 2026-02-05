import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["tsx", "jsx"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
