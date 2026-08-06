// Post-build prerender step: snapshots each public/marketing route to real
// static HTML (title/meta/OG/JSON-LD/content already resolved) so a non-JS
// crawler or social-share scraper sees the real page instead of the empty
// SPA shell. Auth/dashboard/admin routes are intentionally NOT prerendered
// here they are behind login and already `Disallow`'d in robots.txt, so
// there is nothing for a crawler to index there.
//
// This does not change the app's architecture: it's a build-time snapshot
// step using Playwright (already a proven tool in this project's own test
// suite), not a server-side-rendering framework migration. `dist/` still
// ships the same client bundle; hydration takes over normally once the JS
// loads, exactly as it does today.
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const PORT = 4321

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml'
}

// Prerendered so a direct link or share still gets real HTML, even though
// these are currently `noindex` (unpublished placeholder body see
// BlogPost.jsx) and intentionally absent from sitemap.xml.
const BLOG_SLUGS = [
  'how-to-start-an-llc', 'registered-agent-basics', 'ein-business-tax-id',
  'business-bank-readiness', 'licenses-permits-checklist', 'brand-launch-checklist'
]

// Includes both active and inactive (isActive: false in services.js)
// service slugs. Inactive ones are real routes, absent from nav/sitemap,
// and marked `noindex` by ServicePage.jsx still prerendered so a direct
// link renders real content instead of an empty SPA shell.
const SERVICE_SLUGS = [
  'llc-formation', 'business-formation-filings', 'registered-agent', 'ein', 's-corp-election',
  'operating-agreement', 'texas-dba',
  'texas-compliance', 'compliance-filings', 'certificate-of-good-standing', 'apostille-services',
  'formation-kit', 'mail-forwarding',
  'sales-tax-permit', 'licenses-permits', 'bookkeeping',
  'business-banking', 'business-insurance', 'virtual-address', 'legal-documents',
  'funding-search', 'business-coaching', 'business-plan', 'logo-design',
  'business-website', 'domain', 'business-email', 'business-cards', 'trademark'
]

const STATIC_PAGES = [
  '/', '/services', '/pricing', '/how-it-works', '/about', '/reviews',
  '/resources', '/contact', '/help', '/faq',
  '/privacy', '/terms', '/disclaimer', '/cookie-policy', '/refund-policy',
  '/accessibility', '/do-not-sell'
]

const ROUTES = [
  ...STATIC_PAGES,
  ...SERVICE_SLUGS.map(s => `/${s}`),
  ...BLOG_SLUGS.map(s => `/resources/${s}`),
  // Not auth-gated (step 1 is open to anonymous visitors) so, unlike
  // /dashboard or /admin, it needs a real static shell: without this, a
  // direct hit or unfurl bot hitting /formation-details falls through to
  // the SPA's index.html fallback and would incorrectly get the homepage's
  // canonical/title/OG tags baked into that file. Prerendering it here
  // gives it its own correct noindex meta (set by Onboarding.jsx's <SEO>)
  // and a real first-step shell instead of a blank body. Only the bare
  // path is prerendered a `?order=` deep link still needs a live
  // `GET /api/orders/:id` call, which only happens client-side.
  '/formation-details'
]

function startServer() {
  const server = createServer(async (req, res) => {
    let filePath = decodeURIComponent(req.url.split('?')[0])
    let full = path.join(DIST, filePath)
    if (filePath.endsWith('/')) full = path.join(full, 'index.html')
    if (!existsSync(full) || !full.startsWith(DIST)) full = path.join(DIST, 'index.html')
    try {
      const data = await readFile(full)
      res.setHeader('Content-Type', MIME[path.extname(full)] || 'application/octet-stream')
      res.end(data)
    } catch {
      res.statusCode = 404
      res.end('Not found')
    }
  })
  return new Promise(resolve => server.listen(PORT, () => resolve(server)))
}

async function prerenderRoute(browser, route) {
  const page = await browser.newContext().then(ctx => ctx.newPage())
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle', timeout: 20000 })
  // SEO.jsx sets these in a useEffect after mount; wait for the real per-page
  // og:title tag (not just the static index.html default) before snapshotting.
  const ogTitleFound = await page.waitForFunction(() => !!document.querySelector('meta[property="og:title"]'), { timeout: 10000 }).then(() => true).catch(() => false)
  // Reveal-animation elements have a 1200ms fallback-visible timer even
  // without scrolling (useReveal.js) wait past it so captured HTML shows
  // real content, not opacity:0 placeholders.
  await page.waitForFunction(() => document.querySelectorAll('.reveal:not(.is-visible)').length === 0, { timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(300)
  const html = await page.content()
  await page.context().close()
  return { html, errors, ogTitleFound }
}

// A route whose real per-page og:title never appeared didn't actually
// finish mounting (seen intermittently under system load in this dev
// environment, not tied to any specific route) retrying the whole page
// load is cheap and avoids ever shipping a raw static-shell snapshot as if
// it were the real prerendered page.
async function prerenderRouteWithRetry(browser, route, attempts = 3) {
  let last
  for (let i = 0; i < attempts; i++) {
    last = await prerenderRoute(browser, route)
    if (last.ogTitleFound && !last.errors.length) return last
    if (i < attempts - 1) console.warn(`[prerender] ${route}: retrying (attempt ${i + 2}/${attempts})`)
  }
  return last
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ not found run `npm run build` first.')
    process.exit(1)
  }
  const server = await startServer()
  const browser = await chromium.launch()
  let failures = 0

  for (const route of ROUTES) {
    try {
      const { html, errors, ogTitleFound } = await prerenderRouteWithRetry(browser, route)
      if (errors.length) {
        console.warn(`[prerender] ${route}: page errors ${errors.join(' | ')}`)
        failures++
      } else if (!ogTitleFound) {
        console.error(`[prerender] ${route}: og:title never appeared after retries page likely failed to mount`)
        failures++
      }
      const outDir = route === '/' ? DIST : path.join(DIST, route)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, 'index.html'), html)
      console.log(`[prerender] wrote ${route === '/' ? '/index.html' : `${route}/index.html`}`)
    } catch (err) {
      console.error(`[prerender] FAILED ${route}: ${err.message}`)
      failures++
    }
  }

  await browser.close()
  server.close()

  if (failures) {
    console.error(`[prerender] completed with ${failures} failure(s).`)
    process.exit(1)
  }
  console.log(`[prerender] done ${ROUTES.length} routes snapshotted.`)
}

main()
