// next.config.js
import path from "path";
import { fileURLToPath } from "url";

/** Resolve __dirname manually in ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
  },
  serverActions: {
    bodySizeLimit: "10mb", // Increase as needed
  },

  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src"); // or "." if not using "src/"
    return config;
  },
};

export default nextConfig;
