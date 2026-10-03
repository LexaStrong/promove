import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/documents',
        '/drivers',
        '/driver-app',
        '/fuel',
        '/incidents',
        '/intelligence',
        '/ledger',
        '/live-map',
        '/login',
        '/maintenance',
        '/notifications',
        '/register',
        '/reports',
        '/settings',
        '/trips',
        '/vehicles',
      ],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
  };
}