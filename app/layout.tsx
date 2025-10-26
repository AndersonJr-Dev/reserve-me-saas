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
    default: "Reserve.me - Sistema de Agendamento Online para Salões e Barbearias",
    template: "%s | Reserve.me"
  },
  description: "Automatize seus agendamentos e transforme seu salão ou barbearia em um negócio que funciona 24 horas por dia. Sistema completo de agendamento online com link personalizado.",
  keywords: ["agendamento online", "agenda salão", "sistema agendamento", "barbearia online", "salão beleza", "app agendamento"],
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
    url: "https://reserve.me",
    title: "Reserve.me - Sistema de Agendamento Online",
    description: "Automatize seus agendamentos e transforme seu salão ou barbearia em um negócio que funciona 24 horas por dia.",
    siteName: "Reserve.me",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reserve.me - Sistema de Agendamento Online",
    description: "Automatize seus agendamentos e transforme seu salão ou barbearia em um negócio que funciona 24 horas por dia.",
  },
  metadataBase: new URL("https://reserve.me"),
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
