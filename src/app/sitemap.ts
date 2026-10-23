import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: new URL('/', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          'en-GH': new URL('/', siteUrl).toString(),
          en: new URL('/', siteUrl).toString(),
        },
      },
    },
    {
      url: new URL('/privacy', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          'en-GH': new URL('/privacy', siteUrl).toString(),
          en: new URL('/privacy', siteUrl).toString(),
        },
      },
    },
    {
      url: new URL('/contact', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          'en-GH': new URL('/contact', siteUrl).toString(),
          en: new URL('/contact', siteUrl).toString(),
        },
      },
    },
    {
      url: new URL('/llms.txt', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}