import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ignorar erros de ESLint e TypeScript durante o build de produção
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "st.booknet.com" },
      { protocol: "https", hostname: "**.booknet.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
