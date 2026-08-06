// Automated responsive QA: loads real prerendered dist/ pages at the 5
// breakpoints Part 4 requires (320/375/768/1024/1440px) and checks for
// actual horizontal overflow (scrollWidth > clientWidth) an objective,
// automatable proxy for "no horizontal scrolling" that doesn't depend on
// visual judgment. Also opens the mobile nav and chat widget at the two
// narrow widths, since an opened drawer/panel is a common place overflow
// only appears after interaction, not on initial load.
//
// Usage: npm run build (or at least `vite build`) first, then:
//   node scripts/check-responsive.mjs
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist')
const PORT = 4322
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' }

// A prerendered route (e.g. dist/pricing/index.html) is a *directory* on
// disk. This server must be able to serve /pricing (no trailing slash —
// exactly how a browser requests it) against an already-built dist/ that
// already has that directory sitting there from the last build, not just
// against a fresh, empty dist/ so it explicitly checks for a directory
// and serves its index.html, rather than only special-casing a URL that
// happens to already end in "/".
function startServer() {
  const server = createServer(async (req, res) => {
    let filePath = decodeURIComponent(req.url.split('?')[0])
    let full = path.join(DIST, filePath)
    if (existsSync(full) && statSync(full).isDirectory()) full = path.join(full, 'index.html')
    if (!existsSync(full) || !full.startsWith(DIST)) full = path.join(DIST, 'index.html')
    try {
      const data = await readFile(full)
      res.setHeader('Content-Type', MIME[path.extname(full)] || 'application/octet-stream')
      res.end(data)
    } catch { res.statusCode = 404; res.end('Not found') }
  })
  return new Promise(resolve => server.listen(PORT, () => resolve(server)))
}

const WIDTHS = [320, 375, 768, 1024, 1440]
const ROUTES = [
  '/', '/services', '/pricing', '/llc-formation', '/resources', '/contact', '/faq', '/about',
  '/formation-details', '/how-it-works', '/reviews', '/help',
  '/privacy', '/terms', '/disclaimer', '/cookie-policy', '/refund-policy', '/accessibility', '/do-not-sell'
]

async function measureOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const offenders = []
    if (doc.scrollWidth > doc.clientWidth) {
      document.querySelectorAll('body *').forEach(el => {
        if (el.scrollWidth > doc.clientWidth + 2) {
          offenders.push({ tag: el.tagName, cls: el.className?.toString?.().slice(0, 60), w: el.scrollWidth })
        }
      })
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, offenders: offenders.slice(0, 5) }
  })
}

async function main() {
  if (!existsSync(DIST)) { console.error('dist/ not found run `npm run build` first.'); process.exit(1) }
  const server = await startServer()
  const browser = await chromium.launch()
  const results = []

  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await ctx.newPage()
    for (const route of ROUTES) {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load', timeout: 20000 })
      await page.waitForTimeout(150)
      const base = await measureOverflow(page)
      results.push({ width, route, phase: 'initial', ...base })

      // Under the 900px breakpoint the header collapses to a hamburger
      // menu (styles.css) open it and re-measure, since a fixed-position
      // drawer at full viewport width is exactly where overflow bugs hide.
      if (width < 900) {
        const menuBtn = page.locator('.mobile-menu-btn')
        if (await menuBtn.count()) {
          await menuBtn.first().click().catch(() => {})
          await page.waitForTimeout(200)
          results.push({ width, route, phase: 'mobile-menu-open', ...(await measureOverflow(page)) })
          await menuBtn.first().click().catch(() => {})
        }
      }

      // Chat widget floats on every public page (Layout.jsx) open it too.
      const chatToggle = page.locator('.chat-toggle')
      if (await chatToggle.count()) {
        await chatToggle.first().click().catch(() => {})
        await page.waitForTimeout(200)
        results.push({ width, route, phase: 'chat-open', ...(await measureOverflow(page)) })
      }
    }
    await ctx.close()
  }
  await browser.close()
  server.close()

  const bad = results.filter(r => r.overflow > 2)
  console.log(`Checked ${results.length} (route × width × interaction) combinations across ${WIDTHS.join(', ')}px.`)
  if (bad.length === 0) {
    console.log('No horizontal overflow detected at any tested breakpoint/route/interaction combination.')
  } else {
    console.log(`${bad.length} overflow(s) found:`)
    bad.forEach(r => console.log(`  ${r.width}px ${r.route} [${r.phase}]: overflow=${r.overflow}px offenders=${JSON.stringify(r.offenders)}`))
    process.exitCode = 1
  }
}

main()
