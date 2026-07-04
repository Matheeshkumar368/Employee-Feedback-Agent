import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
