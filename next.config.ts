import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel auto-detects, but explicit for clarity
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
