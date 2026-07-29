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
