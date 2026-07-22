import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('abf-user')) } catch { return null }
  })
  const [selectedState, setSelectedState] = useState(() => localStorage.getItem('abf-state') || '')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (user) localStorage.setItem('abf-user', JSON.stringify(user))
    else localStorage.removeItem('abf-user')
  }, [user])

  useEffect(() => {
    if (selectedState) localStorage.setItem('abf-state', selectedState)
  }, [selectedState])

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3500)
  }

  const value = useMemo(() => ({
    user,
    selectedState,
    setSelectedState,
    login: setUser,
    logout: () => setUser(null),
    notify
  }), [user, selectedState])

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
