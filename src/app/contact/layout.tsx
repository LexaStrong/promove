import type { Metadata } from 'next';
import { siteUrl, siteConfig } from '@/lib/site';

const title = 'Contact & Support Desk | ProMove Ghana Fleet Management';
const description =
  'Contact ProMove Ghana customer support, sales, and telematics dispatch. Call +233 59 522 7273, email support@promovegh.com, or chat on WhatsApp. Located in Accra, Ghana.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: new URL('/contact', siteUrl).toString(),
  },
  openGraph: {
    title,
    description,
    url: new URL('/contact', siteUrl).toString(),
    siteName: 'ProMove Fleet Management',
    images: [{
      url: '/og-image.png',
      alt: 'ProMove Ghana Customer Support and Operations Desk',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.socials.handle,
    creator: siteConfig.socials.handle,
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
