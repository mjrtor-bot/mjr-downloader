import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'MJR Downloader — Baixe sua mídia de forma simples',
  description:
    'Analise links de mídias públicas e faça o download direto dos formatos disponíveis com segurança e agilidade.',
  keywords: [
    'mjr downloader',
    'analisador de midia',
    'download de video publico',
    'download de audio',
    'converter mp4',
    'converter mp3',
    'yt-dlp web',
    'ffmpeg streaming',
  ],
  authors: [{ name: 'MJR Downloader Team' }],
  creator: 'MJR Downloader',
  applicationName: 'MJR Downloader',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://mjrdownloader.local',
    title: 'MJR Downloader — Baixe sua mídia de forma simples',
    description:
      'Cole o link de uma mídia pública para analisar os formatos disponíveis e baixar com segurança.',
    siteName: 'MJR Downloader',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MJR Downloader — Baixe sua mídia de forma simples',
    description:
      'Cole o link de uma mídia pública para analisar os formatos disponíveis.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
