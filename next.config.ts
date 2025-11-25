import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;