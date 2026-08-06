import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../lib/api'

const AppContext = createContext(null)

const DRAFT_KEY = 'abf_formation_draft'

function loadFormationDraft() {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    try { window.sessionStorage.removeItem(DRAFT_KEY) } catch { /* storage unavailable */ }
    return null
  }
}

function persistFormationDraft(patch) {
  try {
    const next = { ...(loadFormationDraft() || {}), ...patch, updatedAt: new Date().toISOString() }
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next))
  } catch { /* sessionStorage unavailable fail silently, draft just won't survive a refresh */ }
}

export function AppProvider({ children }) {
  // `user` and `role` are only ever trusted once they come back from the
  // server (via /api/auth/me, /api/auth/login, or /api/auth/signup) never
  // read from localStorage. `authStatus` gates ProtectedRoute so a page
  // can't redirect to /login (or render admin-only content) before the
  // startup session check has actually finished.
  const [user, setUser] = useState(null)
  const [authStatus, setAuthStatus] = useState('loading') // 'loading' | 'authenticated' | 'anonymous'
  const [authServiceError, setAuthServiceError] = useState(false)
  const [businessName, setBusinessNameState] = useState(() => loadFormationDraft()?.businessName || '')
  const [toast, setToast] = useState(null)

  const setBusinessName = (name) => {
    setBusinessNameState(name)
    persistFormationDraft({ businessName: name })
  }

  const clearFormationDraft = () => {
    setBusinessNameState('')
    try { window.sessionStorage.removeItem(DRAFT_KEY) } catch { /* storage unavailable */ }
  }

  useEffect(() => {
    let cancelled = false
    api.me()
      .then(result => {
        if (cancelled) return
        setUser(result?.data || null)
        setAuthStatus(result?.data ? 'authenticated' : 'anonymous')
      })
      .catch(err => {
        if (cancelled) return
        setUser(null)
        setAuthStatus('anonymous')
        // A real 401 just means "not logged in" expected and not an error.
        // Anything else (network failure, 5xx) means the auth service itself
        // is unreachable, which the UI should say plainly rather than
        // quietly behaving as if the visitor simply isn't logged in.
        const isExpectedLoggedOut = err instanceof ApiError && err.status === 401
        if (!isExpectedLoggedOut) setAuthServiceError(true)
      })
    return () => { cancelled = true }
  }, [])

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3500)
  }

  const login = (nextUser) => {
    setUser(nextUser)
    setAuthStatus(nextUser ? 'authenticated' : 'anonymous')
    setAuthServiceError(false)
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // Even if the request itself fails (e.g. already-expired cookie),
      // clearing local state below is what actually matters for the UI —
      // there is nothing further the client can do to keep a dead session.
    } finally {
      setUser(null)
      setAuthStatus('anonymous')
    }
  }

  const value = useMemo(() => ({
    user,
    authStatus,
    authServiceError,
    businessName,
    setBusinessName,
    clearFormationDraft,
    login,
    logout,
    notify
  }), [user, authStatus, authServiceError, businessName])

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && <div className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>{toast.message}</div>}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
