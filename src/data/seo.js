import { SITE_URL, SITE_NAME } from '../components/SEO'

// Single source of truth for the company's published contact details.
// These values are used in the public contact components and schema.
export const SUPPORT_EMAIL = 'info@americanbusinessformations.com'
export const SUPPORT_PHONE = '+1 936 364 9578'
export const SUPPORT_PHONE_TEL = '+19363649578'

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
    telephone: SUPPORT_PHONE_TEL,
    areaServed: 'US-TX'
  }
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL
  // No `potentialAction`/SearchAction this site has no site-wide search
  // endpoint (the /resources filter is client-side only), so one is not
  // added rather than pointed at a URL that doesn't exist.
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

// `author`/`reviewer` should only ever be real named people once an article
// is actually written and reviewed never invent a byline. Omit the field
// entirely (leave it undefined on the post record) until then.
export function articleSchema({ title, description, path, datePublished, dateModified, author, reviewer }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(author ? { author: { '@type': 'Person', name: author } } : {}),
    ...(reviewer ? { reviewedBy: { '@type': 'Person', name: reviewer } } : {}),
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL }
  }
}
