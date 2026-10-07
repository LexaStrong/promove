import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { siteUrl } from '@/lib/site';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
import { FleetProvider } from '@/lib/fleet-context';

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
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'ProMove Fleet Operations and Commercial Telematics',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProMove Fleet Management for Ghana',
    description:
      'Fleet operations for Ghanaian transport businesses. Track vehicles, drivers, daily income, maintenance, documents, and live positions in one workspace.',
    images: ['/og-image.png'],
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

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_dmlhYmxlLWdyaWZmb24tNTU1OS5jbGVyay5hY2NvdW50cy5kZXYk';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pm-theme');if(!t){var m=document.cookie.match(/(?:^|; )pm-theme=([^;]*)/);if(m)t=decodeURIComponent(m[1])}var r=(t==='dark'||t==='light')?t:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',r);if(r==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ClerkProvider publishableKey={clerkPublishableKey}>
          <ThemeProvider>
            <AuthProvider>
              <FleetProvider>
                {children}
              </FleetProvider>
            </AuthProvider>
          </ThemeProvider>
          <Script id="register-sw" strategy="afterInteractive">
          {`
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            var isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isDev) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (var i = 0; i < registrations.length; i++) {
                  registrations[i].unregister();
                }
              });
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (var i = 0; i < names.length; i++) {
                    caches.delete(names[i]);
                  }
                });
              }
            } else {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.debug('ServiceWorker registration error:', err);
                });
              });
            }
          }
          `}
          </Script>
        </ClerkProvider>
      </body>
    </html>
  );
}