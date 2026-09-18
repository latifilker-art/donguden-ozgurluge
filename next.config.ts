import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/panel/renk-analizi": ["./src/lib/color-analysis/fonts/**"],
  },
};

export default nextConfig;
