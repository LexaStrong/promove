import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { siteUrl } from '@/lib/site';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'ProMove Fleet Management for Ghana',
    template: '%s | ProMove',
  },
  description:
    'Fleet operations for Ghanaian transport businesses. Track vehicles, drivers, daily income, maintenance, documents, and live positions in one workspace.',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    siteName: 'ProMove',
    title: 'ProMove Fleet Management for Ghana',
    description:
      'Fleet operations for Ghanaian transport businesses. Track vehicles, drivers, daily income, maintenance, documents, and live positions in one workspace.',
    images: [{
      url: '/auth-splash-desktop.png',
      alt: 'ProMove fleet vehicles on a scenic road',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProMove Fleet Management for Ghana',
    description:
      'Fleet operations for Ghanaian transport businesses. Track vehicles, drivers, daily income, maintenance, documents, and live positions in one workspace.',
    images: ['/auth-splash-desktop.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B4F6C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch((err) => {
                  console.debug('ServiceWorker registration error:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
