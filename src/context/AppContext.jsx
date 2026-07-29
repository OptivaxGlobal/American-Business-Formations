import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('abf-user')) } catch { return null }
  })
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
    if (user) localStorage.setItem('abf-user', JSON.stringify(user))
    else localStorage.removeItem('abf-user')
  }, [user])

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3500)
  }

  const value = useMemo(() => ({
    user,
    businessName,
    setBusinessName,
    clearFormationDraft,
    login: setUser,
    logout: () => setUser(null),
    notify
  }), [user, businessName])

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
