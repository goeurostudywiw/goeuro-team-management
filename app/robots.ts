import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goeurostudy.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/inquiry'],
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/leads',
          '/leads/',
          '/cases',
          '/cases/',
          '/finance',
          '/finance/',
          '/settings',
          '/settings/',
          '/tasks',
          '/tasks/',
          '/marketing',
          '/marketing/',
          '/knowledge',
          '/knowledge/',
          '/guidelines',
          '/guidelines/',
          '/integrations',
          '/integrations/',
          '/login',
          '/meeting',
          '/meeting/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
