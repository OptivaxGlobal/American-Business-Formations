import { useEffect } from 'react'

const SITE_URL = 'https://americanbusinessformations.com'
const SITE_NAME = 'American Business Formations'
const DEFAULT_IMAGE = `${SITE_URL}/logo.webp`

function upsertMeta(attr, key, content) {
  if (!content) return null
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  const created = !el
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
  return created ? el : null
}

function upsertLink(rel, href) {
  if (!href) return null
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  const created = !el
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  return created ? el : null
}

export default function SEO({ title, description, path = '', image, type = 'website', jsonLd, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const prevTitle = document.title
    document.title = fullTitle

    const canonical = `${SITE_URL}${path}`
    const ogImage = image || DEFAULT_IMAGE
    const created = []

    created.push(upsertMeta('name', 'description', description))
    created.push(upsertLink('canonical', canonical))
    created.push(upsertMeta('property', 'og:title', fullTitle))
    created.push(upsertMeta('property', 'og:description', description))
    created.push(upsertMeta('property', 'og:url', canonical))
    created.push(upsertMeta('property', 'og:type', type))
    created.push(upsertMeta('property', 'og:site_name', SITE_NAME))
    created.push(upsertMeta('property', 'og:image', ogImage))
    created.push(upsertMeta('name', 'twitter:card', 'summary_large_image'))
    created.push(upsertMeta('name', 'twitter:title', fullTitle))
    created.push(upsertMeta('name', 'twitter:description', description))
    created.push(upsertMeta('name', 'twitter:image', ogImage))
    created.push(upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow'))

    let scriptEl = null
    if (jsonLd) {
      scriptEl = document.createElement('script')
      scriptEl.type = 'application/ld+json'
      scriptEl.text = JSON.stringify(jsonLd)
      document.head.appendChild(scriptEl)
    }

    return () => {
      document.title = prevTitle
      created.filter(Boolean).forEach(el => el.remove())
      if (scriptEl) scriptEl.remove()
    }
  }, [title, description, path, image, type, jsonLd, noindex])

  return null
}

export { SITE_URL, SITE_NAME, DEFAULT_IMAGE }
