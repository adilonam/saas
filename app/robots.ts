import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/signin',
          '/signup',
        ],
      },
    ],
    sitemap: 'https://www.eprod.io/sitemap.xml',
  }
}

