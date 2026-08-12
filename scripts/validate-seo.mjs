// Automated SEO validation run after `npm run build` (which runs
// scripts/prerender.mjs via postbuild) against the real dist/ output.
// Catches exactly the class of bug this project has hit before: a route,
// a sitemap entry, and a prerendered file quietly drifting out of sync.
//
// Usage: node scripts/validate-seo.mjs
// Exits non-zero (and CI-fails) on any check failure.
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SITE_URL = 'https://americanbusinessformations.com'

// Mirrors the SITE_WIDE_NOINDEX flag in src/components/SEO.jsx by hand
// keep both in sync. While true, every page (sitemap-listed or not) is
// expected to render "noindex, nofollow", so check #3 below validates
// against that instead of "index, follow". This script still fails the
// build if any page's robots meta drifts from whichever mode is actually
// active, rather than silently skipping the check.
const SITE_WIDE_NOINDEX = true

// Route prefixes that must never appear in sitemap.xml and must always be
// blocked in robots.txt kept in sync by hand with src/App.jsx's
// non-Layout routes (auth pages, /dashboard, /admin) plus /formation-details
// and the error pages. If a new private route is added to App.jsx without
// updating this list, this script won't catch it App.jsx is the source
// of truth; this is a cross-check, not a generator.
const PRIVATE_PREFIXES = [
  '/dashboard', '/admin', '/formation-details', '/login', '/signup',
  '/verify-email', '/forgot-password', '/reset-password',
  '/404', '/500'
]

const errors = []
const warnings = []
const fail = msg => errors.push(msg)
const warn = msg => warnings.push(msg)

function extractAll(html, re) {
  return [...html.matchAll(re)].map(m => m[1])
}

function routeToDistFile(routePath) {
  const clean = routePath === '/' ? '' : routePath.replace(/\/+$/, '')
  return path.join(DIST, clean, 'index.html')
}

async function loadSitemapUrls() {
  const xml = await readFile(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8')
  const locs = extractAll(xml, /<loc>([^<]+)<\/loc>/g)
  if (locs.length === 0) fail('sitemap.xml contains zero <url> entries')
  return locs
}

async function loadRobotsDisallow() {
  const txt = await readFile(path.join(ROOT, 'public', 'robots.txt'), 'utf8')
  return extractAll(txt, /^Disallow:\s*(\S+)/gm)
}

function analyzeHtml(html, file) {
  const titles = extractAll(html, /<title>([^<]*)<\/title>/g)
  const canonicals = extractAll(html, /<link rel="canonical" href="([^"]+)"/g)
  const descriptions = extractAll(html, /<meta name="description" content="([^"]*)"/g)
  const robots = extractAll(html, /<meta name="robots" content="([^"]*)"/g)
  const ogTitle = extractAll(html, /<meta property="og:title" content="([^"]*)"/g)
  const ogDesc = extractAll(html, /<meta property="og:description" content="([^"]*)"/g)
  const ogUrl = extractAll(html, /<meta property="og:url" content="([^"]*)"/g)
  const twitterCard = extractAll(html, /<meta name="twitter:card" content="([^"]*)"/g)
  const h1s = extractAll(html, /<h1[^>]*>/g)

  if (titles.length !== 1) fail(`${file}: expected exactly 1 <title>, found ${titles.length}`)
  if (canonicals.length !== 1) fail(`${file}: expected exactly 1 canonical link, found ${canonicals.length}`)
  if (descriptions.length !== 1 || !descriptions[0]) fail(`${file}: missing or empty meta description`)
  if (robots.length !== 1) fail(`${file}: expected exactly 1 robots meta tag, found ${robots.length}`)
  if (ogTitle.length !== 1) fail(`${file}: missing og:title`)
  if (ogDesc.length !== 1) fail(`${file}: missing og:description`)
  if (ogUrl.length !== 1) fail(`${file}: missing og:url`)
  if (twitterCard.length !== 1) fail(`${file}: missing twitter:card`)
  if (h1s.length !== 1) fail(`${file}: expected exactly 1 <h1>, found ${h1s.length} (heading-order / duplicate-hero risk)`)

  return {
    title: titles[0] || '', canonical: canonicals[0] || '', description: descriptions[0] || '',
    robots: robots[0] || '', ogUrl: ogUrl[0] || ''
  }
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ not found run `npm run build` first.')
    process.exit(1)
  }
  if (SITE_WIDE_NOINDEX) {
    console.warn('[validate-seo] SITE_WIDE_NOINDEX is ON every page in this build is noindex, nofollow. Turn it off in src/components/SEO.jsx (and here) when ready to be indexed again.')
  }

  const sitemapUrls = await loadSitemapUrls()
  const disallow = await loadRobotsDisallow()

  // 1. Every private prefix must actually be blocked in robots.txt.
  for (const prefix of PRIVATE_PREFIXES) {
    if (!disallow.includes(prefix)) fail(`robots.txt is missing "Disallow: ${prefix}"`)
  }

  // 2. No sitemap URL may point at a private route.
  for (const url of sitemapUrls) {
    const routePath = url.replace(SITE_URL, '') || '/'
    if (PRIVATE_PREFIXES.some(p => routePath === p || routePath.startsWith(p + '/'))) {
      fail(`sitemap.xml lists a private route: ${url}`)
    }
    if (!url.startsWith(SITE_URL + '/') && url !== SITE_URL + '/') {
      fail(`sitemap.xml URL does not use the canonical site origin: ${url}`)
    }
    if (url !== SITE_URL + '/' && url.endsWith('/')) {
      fail(`sitemap.xml URL has an inconsistent trailing slash: ${url}`)
    }
  }

  // 3. Every sitemap URL must resolve to a real prerendered file, must be
  //    indexable (index, follow), and its canonical must self-reference.
  const seenTitles = new Map()
  const seenDescriptions = new Map()
  const seenCanonicals = new Map()
  let checked = 0

  for (const url of sitemapUrls) {
    const routePath = url.replace(SITE_URL, '') || '/'
    const file = routeToDistFile(routePath)
    if (!existsSync(file)) { fail(`sitemap.xml references ${url} but ${path.relative(ROOT, file)} was not prerendered`); continue }
    const html = await readFile(file, 'utf8')
    const meta = analyzeHtml(html, path.relative(ROOT, file))
    checked++

    const expectedRobots = SITE_WIDE_NOINDEX ? 'noindex, nofollow' : 'index, follow'
    if (meta.robots !== expectedRobots) fail(`${path.relative(ROOT, file)}: is in sitemap.xml but robots meta is "${meta.robots}" (expected "${expectedRobots}")`)
    const expectedCanonical = routePath === '/' ? SITE_URL + '/' : SITE_URL + routePath
    if (meta.canonical !== expectedCanonical) fail(`${path.relative(ROOT, file)}: canonical "${meta.canonical}" does not match its own sitemap URL "${expectedCanonical}"`)
    if (meta.ogUrl !== expectedCanonical) fail(`${path.relative(ROOT, file)}: og:url "${meta.ogUrl}" does not match canonical`)

    if (seenTitles.has(meta.title)) fail(`Duplicate <title> "${meta.title}" ${seenTitles.get(meta.title)} and ${url}`)
    else seenTitles.set(meta.title, url)
    if (seenDescriptions.has(meta.description)) fail(`Duplicate meta description ${seenDescriptions.get(meta.description)} and ${url}`)
    else seenDescriptions.set(meta.description, url)
    if (seenCanonicals.has(meta.canonical)) fail(`Duplicate canonical "${meta.canonical}" ${seenCanonicals.get(meta.canonical)} and ${url}`)
    else seenCanonicals.set(meta.canonical, url)
  }

  // 4. Spot-check known-noindex routes actually carry noindex in their
  //    prerendered output (catches the SEO.jsx/route wiring drifting apart).
  const expectedNoindex = ['/formation-details']
  for (const routePath of expectedNoindex) {
    const file = routeToDistFile(routePath)
    if (!existsSync(file)) { warn(`expected-noindex route ${routePath} was not prerendered cannot verify`); continue }
    const html = await readFile(file, 'utf8')
    const robots = extractAll(html, /<meta name="robots" content="([^"]*)"/g)[0] || ''
    if (!robots.startsWith('noindex')) fail(`${routePath} should be noindex but robots meta is "${robots}"`)
  }

  console.log(`[validate-seo] checked ${checked} sitemap URLs, ${sitemapUrls.length} total sitemap entries, ${disallow.length} robots.txt disallow rules.`)
  if (warnings.length) {
    console.warn(`[validate-seo] ${warnings.length} warning(s):`)
    warnings.forEach(w => console.warn(`  - ${w}`))
  }
  if (errors.length) {
    console.error(`[validate-seo] FAILED with ${errors.length} error(s):`)
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  }
  console.log('[validate-seo] all checks passed.')
}

main()
