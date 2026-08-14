#!/usr/bin/env node
// Regenerates src/data/geography/<STATE>.json the County/City autocomplete
// data source for the LLC formation wizard's Business Basics step.
//
// Source: U.S. Census Bureau 2023 Gazetteer Files (official, free, no API
// key required) the same authority-grade geographic reference used by
// federal agencies. Two flat files cover every state in the country:
//   - counties: legal county / county-equivalent names (incl. Louisiana
//     parishes, Alaska boroughs, and Virginia's independent cities, which
//     the Census treats as county-equivalents exactly the entities that
//     belong in a "County" field for LLC filings)
//   - places: incorporated cities/towns/villages/boroughs (FUNCSTAT "A" —
//     an active governmental unit with its own elected government, as
//     opposed to a Census-only statistical area like a CDP)
// https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html
//
// Usage: node scripts/generate-geography.mjs
// Re-run whenever the Census publishes a new annual Gazetteer release, or
// to add a state to STATE_CODES below. Downloads ~6MB of source text into
// scripts/geo-source/ (gitignored regenerate locally, don't commit it)
// and writes one compact JSON file per state into src/data/geography/,
// which IS committed (that's the only thing the app actually loads).

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SOURCE_DIR = path.join(__dirname, 'geo-source')
const OUT_DIR = path.join(ROOT, 'src/data/geography')

// The 21 states American Business Formations currently supports for LLC
// formation (src/data/states.js is the source of truth for this list —
// keep in sync by hand if a state is ever added/removed there).
// 2026-08-13: expanded from the original 21 states to all 52 LLC-Formation
// jurisdictions (50 states + DC + PR) — the Census Gazetteer files already
// cover DC and Puerto Rico (PR's municipios are its county-equivalents),
// so no separate data source was needed for those two.
const STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC', 'PR',
]

const GAZETTEER_YEAR = '2023'
const COUNTIES_URL = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${GAZETTEER_YEAR}_Gazetteer/${GAZETTEER_YEAR}_Gaz_counties_national.zip`
const PLACES_URL = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${GAZETTEER_YEAR}_Gazetteer/${GAZETTEER_YEAR}_Gaz_place_national.zip`

async function ensureSourceFile(url, zipName, txtName) {
  const txtPath = path.join(SOURCE_DIR, txtName)
  if (fs.existsSync(txtPath)) return txtPath
  fs.mkdirSync(SOURCE_DIR, { recursive: true })
  console.log(`Downloading ${url} ...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const zipPath = path.join(SOURCE_DIR, zipName)
  fs.writeFileSync(zipPath, buf)
  // Minimal zip extraction via the system `unzip` binary this script is a
  // maintainer tool run manually/occasionally, not part of the app runtime,
  // so shelling out is acceptable here rather than adding a zip dependency
  // to the whole project just for this.
  const { execSync } = await import('child_process')
  execSync(`unzip -o "${zipPath}" -d "${SOURCE_DIR}"`, { stdio: 'inherit' })
  return txtPath
}

// The Gazetteer files are Latin-1 by default, but Puerto Rico's Spanish
// place names (ñ, á, é, í, ó, ú...) are embedded as raw UTF-8 bytes within
// that same Latin-1 file — decoding those bytes as Latin-1 produces
// mojibake ("Añasco" -> "AÃ±asco"). Detected by the telltale "Ã" byte
// pattern; re-decoding just those fields as UTF-8 recovers the original
// text without disturbing the (correctly Latin-1) rest of the file.
function fixMojibake(str) {
  if (!/Ã./.test(str)) return str
  try {
    const fixed = Buffer.from(str, 'latin1').toString('utf8')
    if (!fixed.includes('�')) return fixed
  } catch { /* not actually mojibake — leave as-is */ }
  return str
}

function readTsv(file) {
  // Gazetteer files are Latin-1 encoded, tab-delimited, with trailing
  // whitespace padding on the last column.
  const raw = fs.readFileSync(file, 'latin1')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const header = lines[0].split('\t').map(h => h.trim())
  return lines.slice(1).map(line => {
    const cols = line.split('\t')
    const row = {}
    header.forEach((h, i) => { row[h] = fixMojibake((cols[i] || '').trim()) })
    return row
  })
}

// Strips the Census legal/statistical-area-descriptor suffix for display
// ("Houston city" -> "Houston") while leaving county-equivalent names
// alone (those are generated separately, straight from the counties file,
// and never passed through this).
const SUFFIX_STRIP = /\s+(city|town|village|borough|CDP|municipality|township)$/i
function displayPlaceName(name) {
  const stripped = name.replace(SUFFIX_STRIP, '')
  return stripped.length >= 2 ? stripped : name
}

async function main() {
  const countiesFile = await ensureSourceFile(COUNTIES_URL, 'counties.zip', `${GAZETTEER_YEAR}_Gaz_counties_national.txt`)
  const placesFile = await ensureSourceFile(PLACES_URL, 'places.zip', `${GAZETTEER_YEAR}_Gaz_place_national.txt`)

  const counties = readTsv(countiesFile)
  const places = readTsv(placesFile)

  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const usps of STATE_CODES) {
    const stCounties = counties
      .filter(r => r.USPS === usps)
      .map(r => r.NAME)
      .sort((a, b) => a.localeCompare(b))

    // FUNCSTAT 'A' = active governmental unit (incorporated city/town/
    // village/borough with its own government) excludes Census
    // Designated Places (CDPs), which are statistical-only and have no
    // legal government to name as a business's city in a state filing.
    // A customer whose community is a CDP or otherwise not listed here
    // always has "Other / Not Listed" as a safe fallback in the UI.
    // Three jurisdiction-specific exceptions (2026-08-13 nationwide
    // expansion): Hawaii has no incorporated municipalities at all (every
    // populated place is a CDP), so falls back to CDPs (FUNCSTAT=S) so
    // real places like Honolulu stay selectable. DC is coded FUNCSTAT=N
    // (nonfunctioning legal entity Congress absorbed the historical City
    // of Washington into the unified DC government), so it is hardcoded.
    // Puerto Rico's place layer is entirely statistical; in PR addressing
    // convention the municipio itself is used as the city, so it reuses
    // the county list.
    let dedupedCities
    if (usps === 'DC') {
      dedupedCities = ['Washington']
    } else if (usps === 'PR') {
      dedupedCities = stCounties.slice()
    } else {
      const fallbackToStatistical = usps === 'HI'
      const placeNames = places
        .filter(r => r.USPS === usps && (r.FUNCSTAT === 'A' || (fallbackToStatistical && r.FUNCSTAT === 'S')))
        .map(r => displayPlaceName(r.NAME))
      dedupedCities = Array.from(new Set(placeNames)).sort((a, b) => a.localeCompare(b))
    }

    const out = {
      stateCode: usps,
      source: `U.S. Census Bureau, ${GAZETTEER_YEAR} Gazetteer Files (counties + incorporated places, FUNCSTAT=Active)`,
      sourceUrl: 'https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html',
      generatedAt: new Date().toISOString().slice(0, 10),
      counties: stCounties,
      cities: dedupedCities,
    }
    fs.writeFileSync(path.join(OUT_DIR, `${usps}.json`), JSON.stringify(out, null, 2) + '\n')
    console.log(`${usps}: ${stCounties.length} counties, ${dedupedCities.length} cities`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
