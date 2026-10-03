import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site';

const title = 'Data privacy policy';
const description =
  'Read how ProMove handles fleet, driver, location, financial, and account information under Ghana’s Data Protection Act, 2012 (Act 843).';

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
    images: [{
      url: '/auth-splash-desktop.png',
      alt: 'ProMove fleet vehicles on a scenic road',
    }],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
