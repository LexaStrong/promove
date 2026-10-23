import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { siteUrl, siteConfig, getRootStructuredData } from '@/lib/site';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
import { FleetProvider } from '@/lib/fleet-context';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'ProMove Fleet Management for Ghana | Vehicles, Drivers & Revenue',
    template: '%s | ProMove',
  },
  description:
    'Dedicated fleet operations platform for Ghanaian transport businesses. Manage vehicles, track daily income in exact pesewas, monitor live GPS telematics, and automate DVLA document reminders.',
  applicationName: 'ProMove',
  authors: [{ name: 'ProMove Ghana', url: siteConfig.url }],
  creator: `ProMove Ghana (${siteConfig.socials.handle})`,
  publisher: siteConfig.legalName,
  category: 'Fleet Management & Transport Technology',
  keywords: [
    'fleet management Ghana',
    'vehicle tracking Ghana',
    'trotro fleet management',
    'DVLA roadworthiness alerts Ghana',
    'commercial vehicle ledger Accra',
    'GPS vehicle telematics Kumasi',
    'transport cashflow software Ghana',
    'Ghana logistics platform',
    'ProMove',
    'ProMove Ghana',
    'promovegh',
    'transport business software Accra',
  ],
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-GH': '/',
      en: '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: siteConfig.url,
    siteName: 'ProMove Fleet Management',
    title: 'ProMove Fleet Management for Ghana | Vehicles, Drivers & Revenue',
    description:
      'Dedicated fleet operations platform for Ghanaian transport businesses. Manage vehicles, track daily income in exact pesewas, monitor live GPS telematics, and automate DVLA document reminders.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ProMove Fleet Operations and Commercial Telematics for Ghana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.socials.handle,
    creator: siteConfig.socials.handle,
    title: 'ProMove Fleet Management for Ghana',
    description:
      'Fleet operations for Ghanaian transport businesses. Track vehicles, daily cashflow in pesewas, maintenance, and live positions in one workspace.',
    images: ['/og-image.png'],
  },
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
  other: {
    'geo.region': siteConfig.geo.region,
    'geo.placename': siteConfig.geo.placename,
    'geo.position': `${siteConfig.geo.latitude};${siteConfig.geo.longitude}`,
    'ICBM': `${siteConfig.geo.latitude}, ${siteConfig.geo.longitude}`,
    'contact:email': siteConfig.supportEmail,
    'contact:phone_number': siteConfig.phone,
    'rating': 'General',
    'revisit-after': '7 days',
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
  const structuredData = getRootStructuredData();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pm-theme');if(!t){var m=document.cookie.match(/(?:^|; )pm-theme=([^;]*)/);if(m)t=decodeURIComponent(m[1])}var r=(t==='dark'||t==='light')?t:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',r);if(r==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
        {/* Schema.org Organization, WebSite & SoftwareApplication JSON-LD for SEO, AEO & GEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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