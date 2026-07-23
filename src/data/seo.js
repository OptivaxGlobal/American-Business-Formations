import { SITE_URL, SITE_NAME } from '../components/SEO'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.webp`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-307-555-0184',
    contactType: 'customer service',
    email: 'support@americanbusinessformations.com',
    areaServed: 'US'
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Sheridan',
    addressRegion: 'WY',
    addressCountry: 'US'
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.path ? `${SITE_URL}${item.path}` : undefined
    }))
  }
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer }
    }))
  }
}

export function serviceSchema({ name, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL }
  }
}

export function articleSchema({ title, description, path, datePublished }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    ...(datePublished ? { datePublished } : {}),
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL }
  }
}
