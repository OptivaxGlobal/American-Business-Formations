import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

function createMemoryStorage() {
  const store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)) },
    removeItem: (key) => { store.delete(key) },
    clear: () => { store.clear() },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size }
  }
}

// Node's own built-in `localStorage`/`sessionStorage` globals (stable since
// Node 22+) can shadow jsdom's window.localStorage and are non-functional
// without a --localstorage-file flag. Force both `window` and the bare
// global identifier to a working in-memory implementation for tests.
function patchStorage(name) {
  const storage = createMemoryStorage()
  for (const target of [globalThis, typeof window !== 'undefined' ? window : null]) {
    if (!target) continue
    try {
      Object.defineProperty(target, name, { value: storage, configurable: true, writable: true })
    } catch {
      /* ignore targets that refuse redefinition */
    }
  }
}

patchStorage('localStorage')
patchStorage('sessionStorage')

// `patchStorage` builds each storage's backing Map once, when this setup
// module loads — with nothing resetting it, every test in the file shares
// the exact same sessionStorage/localStorage instance. That's exactly the
// kind of leak that intermittently made Onboarding.test.jsx fail (a
// sessionStorage-persisted wizard draft from an earlier test in the file
// was still present, occasionally landing right as the next test mounted,
// so it opened already partway through the wizard instead of at step 1).
// Clearing both after every test — not just Onboarding's own tests, any
// future test relying on storage starting empty — closes it for good.
afterEach(() => {
  globalThis.localStorage?.clear?.()
  globalThis.sessionStorage?.clear?.()
})

// Default fetch stub so every test that mounts <AppProvider> (most of them,
// via AllProviders) gets a fast, deterministic 401 for the startup
// GET /api/auth/me check instead of an unmocked real network attempt —
// avoids act() warnings and slow connection-refused delays in tests that
// don't care about auth state at all. Any test that DOES care can still
// override this per-test with vi.stubGlobal('fetch', ...); Vitest restores
// this default afterward via vi.unstubAllGlobals().
if (typeof globalThis.fetch === 'undefined' || !globalThis.fetch.__isDefaultTestStub) {
  const defaultFetchStub = async (url) => {
    // /auth/me specifically resolves as "not logged in" (a real, expected
    // 401) rather than a network failure, so AppContext's authServiceError
    // flag stays false by default across the suite.
    if (String(url).includes('/auth/me')) {
      return {
        ok: false, status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ ok: false, message: 'Not authenticated' })
      }
    }
    // Everything else looks like a genuinely unreachable backend (the real
    // default in every environment that isn't explicitly mocking fetch) —
    // every call site treats this as a real error, never a fake success.
    throw new Error('fetch is not mocked for this test')
  }
  defaultFetchStub.__isDefaultTestStub = true
  globalThis.fetch = defaultFetchStub
}
