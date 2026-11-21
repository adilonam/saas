import { Metadata } from 'next';

const SITE_URL = 'https://www.eprod.io';
const SITE_NAME = 'eProd';
const SITE_DESCRIPTION = 'Free online productivity tools: calculators, generators, converters, and AI-powered utilities for work, business, and personal use.';

interface ToolMetadataParams {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  category?: string;
}

export function generateToolMetadata({
  title,
  description,
  path,
  keywords = [],
  category = 'Tools',
}: ToolMetadataParams): Metadata {
  const fullTitle = `${title} – ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  
  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description,
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
    category,
  };
}

export function generateJsonLd(data: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: data.applicationCategory || 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: data.offers || {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
  };
}

export const SITE_METADATA = {
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
};
