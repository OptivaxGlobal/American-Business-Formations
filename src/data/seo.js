import { SITE_URL, SITE_NAME } from '../components/SEO'

// Single source of truth for the company's published contact address.
// A phone number and street address were not found anywhere in this
// project do not add invented ones. If the business owner supplies real
// values, set them here (and in EMAIL vars server-side) rather than
// scattering them across components.
export const SUPPORT_EMAIL = 'info@americanbusinessformations.com'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.webp`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: SUPPORT_EMAIL,
    areaServed: 'US-TX'
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
