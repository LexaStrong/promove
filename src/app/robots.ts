import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

const privateRoutes = [
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
  '/onboarding',
  '/register',
  '/reports',
  '/settings',
  '/trips',
  '/vehicles',
  '/admin',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy', '/llms.txt', '/llms-full.txt', '/manifest.json', '/favicon.ico', '/icon.png', '/og-image.png'],
        disallow: privateRoutes,
      },
      // Explicitly allow leading AI & Answer Engine bots for AEO and GEO visibility
      {
        userAgent: [
          'Google-Extended',
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Applebot-Extended',
          'cohere-ai',
          'OAI-SearchBot',
        ],
        allow: ['/', '/privacy', '/llms.txt', '/llms-full.txt'],
        disallow: privateRoutes,
      },
    ],
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
    host: siteUrl.origin,
  };
}