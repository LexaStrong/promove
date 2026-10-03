import type { Metadata } from 'next';

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promove.gh';

export const siteUrl = new URL(configuredSiteUrl);

export const privatePageRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};