import { useEffect } from 'react'

const SITE_URL = 'https://americanbusinessformations.com'
const SITE_NAME = 'American Business Formations'
const DEFAULT_IMAGE = `${SITE_URL}/logo.webp`

// TEMPORARY, site-wide: the client does not want this site indexed right
// now. Flipping this one flag is the entire on/off switch for that — every
// page (public or already-noindex) renders "noindex, nofollow" while this
// is true, and every page goes back to its own normal per-page `noindex`
// prop the moment this is set back to false. Deliberately implemented here
// (the one component every page already renders through) rather than by
// editing every route's <SEO> call, so turning it off later is a one-line
// change, not a re-audit of every page.
const SITE_WIDE_NOINDEX = true

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

// `follow` only matters when `noindex` is true it controls whether the
// robots meta reads "noindex, nofollow" (the right default for auth/private
// app screens, which have nothing worth crawling onward from) or
// "noindex, follow" (for a page that's excluded from search itself but
// still links to real, indexable pages worth reaching, e.g. an unpublished
// resource article or unlaunched service page linking to active ones).
export default function SEO({ title, description, path = '', image, type = 'website', jsonLd, noindex = false, follow = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const prevTitle = document.title
    document.title = fullTitle

    // Normalize so a page passing a trailing slash (or none) always produces
    // the same canonical URL prevents duplicate-content ambiguity. The
    // homepage is the one path that keeps its trailing slash, matching both
    // sitemap.xml (`.../` ) and index.html's static canonical every other
    // path never has one, matching every other prerendered route.
    const normalizedPath = path === '/' || path === '' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`
    const canonical = normalizedPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalizedPath}`
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
    const robotsContent = SITE_WIDE_NOINDEX
      ? 'noindex, nofollow'
      : (noindex ? `noindex, ${follow ? 'follow' : 'nofollow'}` : 'index, follow')
    created.push(upsertMeta('name', 'robots', robotsContent))
    created.push(upsertMeta('name', 'googlebot', robotsContent))

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
