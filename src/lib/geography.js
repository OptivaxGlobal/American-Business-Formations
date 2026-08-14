// Loads County/City autocomplete data for a single formation state, on
// demand, from src/data/geography/<STATE>.json (see
// scripts/generate-geography.mjs for provenance U.S. Census Bureau
// Gazetteer Files). Only the currently-selected state's ~1-10KB file is
// ever fetched; the other 20 states' data never enters the bundle for a
// visitor who only forms an LLC in one state (Vite code-splits each
// import.meta.glob() entry into its own lazy chunk automatically).

// eager:false (the default) keeps every state file as a separate chunk,
// only fetched the first time that state is actually selected.
const stateModules = import.meta.glob('../data/geography/*.json')

const cache = new Map() // stateCode -> Promise<GeographyResult>
const IMPORT_TIMEOUT_MS = 8000

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), ms))
}

// A legitimate customer must never be blocked just because their county or
// city isn't in the dataset (postal/community names don't always map
// cleanly onto Census places, and some places span more than one county).
// Every result success, unsupported state, or load failure includes
// this same shape so callers never have to special-case a failure mode.
function emptyResult(stateCode, extra = {}) {
  return { stateCode, counties: [], cities: [], loading: false, unavailable: true, ...extra }
}

async function importWithRetry(importer, attempts = 2) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      return await Promise.race([importer(), timeout(IMPORT_TIMEOUT_MS)])
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

// Returns { stateCode, counties, cities, unavailable } for the given state.
// Never throws a network hiccup or an unsupported state both resolve to
// an empty-but-usable result so the caller can fall back to free-text /
// "Other or Not Listed" entry rather than blocking the wizard.
export function loadStateGeography(stateCode) {
  const code = String(stateCode || '').toUpperCase()
  if (!code) return Promise.resolve(emptyResult(code))
  if (cache.has(code)) return cache.get(code)

  const key = `../data/geography/${code}.json`
  const importer = stateModules[key]
  if (!importer) {
    const result = Promise.resolve(emptyResult(code))
    cache.set(code, result)
    return result
  }

  const promise = importWithRetry(importer)
    .then(mod => ({
      stateCode: code,
      counties: mod.default?.counties || [],
      cities: mod.default?.cities || [],
      loading: false,
      unavailable: false,
    }))
    .catch(() => emptyResult(code))
  cache.set(code, promise)
  return promise
}

export const OTHER_NOT_LISTED = 'Other / Not Listed'

// Simple, fast case-insensitive "contains" match, prioritizing names that
// start with the query (matches the example UX: "Mont" -> "Montgomery
// County" before any county that merely contains "mont" mid-word). Capped
// so a broad query on a large state (e.g. Texas' 1,221 cities) never
// renders an unbounded list.
export function filterOptions(options, query, limit = 50) {
  const q = query.trim().toLowerCase()
  if (!q) return options.slice(0, limit)
  const starts = []
  const contains = []
  for (const opt of options) {
    const lower = opt.toLowerCase()
    if (lower.startsWith(q)) starts.push(opt)
    else if (lower.includes(q)) contains.push(opt)
    if (starts.length + contains.length >= limit * 3) break // cheap early-out on huge states
  }
  return [...starts, ...contains].slice(0, limit)
}
