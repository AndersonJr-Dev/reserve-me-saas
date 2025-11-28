import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Reserve.me | Sistema para Salões e Barbearias",
    template: "%s | Reserve.me"
  },
  description:
    "Software completo para agendamento online, gestão financeira e controle de comissões para salões de beleza e barbearias. Teste grátis.",
  keywords: [
    "sistema para salão de beleza",
    "programa para barbearia",
    "app de agendamento online",
    "software de gestão de estética",
    "agendamento online",
    "gestão de barbearia",
    "software estética",
    "controle de comissão",
    "gestão financeira",
    "agenda online para clínica de estética"
  ],
  authors: [{ name: "Reserve.me" }],
  creator: "Reserve.me",
  publisher: "Reserve.me",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://reserve-me-online.vercel.app",
    title: "Transforme a gestão do seu salão",
    description: "Pare de perder agendamentos. Tenha seu próprio site de reservas.",
    siteName: "Reserve.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reserve.me - Sistema de Agendamento Online",
    description: "Automatize seus agendamentos e transforme seu salão ou barbearia em um negócio que funciona 24 horas por dia.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://reserve-me-online.vercel.app"),
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
