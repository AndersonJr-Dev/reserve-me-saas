import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignora erros de lint durante o deploy na Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora erros de tipagem durante o deploy
    ignoreBuildErrors: true,
  },
  images: {
    // Permite carregar imagens de qualquer lugar (corrige o aviso do <img>)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;