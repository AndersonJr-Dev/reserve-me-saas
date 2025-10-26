import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Força renderização dinâmica nas páginas que usam search params
  experimental: {
    // Desabilita static generation em certas rotas
  }
};

export default nextConfig;
