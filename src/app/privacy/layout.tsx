import type { Metadata } from 'next';
import { siteUrl, siteConfig } from '@/lib/site';

const title = 'Data Privacy Policy & Statutory Compliance (Act 843) | ProMove Ghana';
const description =
  'Read how ProMove handles fleet, driver, location telematics, financial ledger, and confidential vehicle documents under Ghana’s Data Protection Act, 2012 (Act 843).';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: new URL('/privacy', siteUrl).toString(),
  },
  openGraph: {
    title,
    description,
    url: new URL('/privacy', siteUrl).toString(),
    siteName: 'ProMove Fleet Management',
    images: [{
      url: '/auth-splash-desktop.png',
      alt: 'ProMove Fleet Data Protection and Governance in Ghana',
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

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
