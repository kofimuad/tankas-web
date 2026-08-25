import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Issue photos, resolution proof and avatars are uploaded to Cloudinary by
    // the API (`app/utils/cloudinary_helper.py`).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
