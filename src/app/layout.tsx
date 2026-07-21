// ============================================================
// Ultra Video Downloader — Root Layout (Natural Flow)
// ============================================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NotificationContainer } from '@/components/ui/NotificationToast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Ultra Video Downloader — Fast & Secure Video Downloads',
  description:
    'Download videos from supported websites quickly and securely. Premium video downloader with queue management, format selection, and beautiful interface.',
  keywords: ['video downloader', 'download video', 'mp4 download', 'video converter'],
  authors: [{ name: 'Ultra Video Downloader Team' }],
  openGraph: {
    title: 'Ultra Video Downloader',
    description: 'Download videos from supported websites quickly and securely.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-theme="dark">
      <body className="min-h-screen w-full flex flex-col items-center justify-start bg-[#09090e] text-slate-100 overflow-x-hidden antialiased">
        <Providers>
          <Navbar />
          <main className="w-full flex-1 flex flex-col items-center relative z-10 pt-8 sm:pt-12 pb-24 px-4 sm:px-8">
            {children}
          </main>
          <Footer />
          <NotificationContainer />
        </Providers>
      </body>
    </html>
  );
}
