import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useApp } from './AppContext'

const BusinessContext = createContext(null)

export function BusinessProvider({ children }) {
  const { user, authStatus } = useApp()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Which business is "selected" in a multi-business account is a small,
  // non-sensitive UI preference the business data itself always comes
  // from the server below, this just remembers a choice within the tab.
  const [selectedBusinessId, setSelectedBusinessId] = useState(null)

  const load = useCallback(() => {
    // AppContext's /api/auth/me check hasn't resolved yet stay in the
    // initial `loading: true` state rather than bailing to an empty list.
    // Without this guard, `loading` flips to false (bailing on `!user`)
    // before the real auth check finishes, and the instant it does finish
    // ProtectedRoute renders a business-detail page in the same commit —
    // which would see `loading: false, businesses: []` and incorrectly
    // redirect away before the real fetch below ever gets a chance to run.
    if (authStatus === 'loading') return
    if (!user) {
      setBusinesses([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    api.listBusinesses()
      .then(result => {
        const rows = (result?.data || []).map(row => ({ ...row.business, application: row.application }))
        setBusinesses(rows)
        setSelectedBusinessId(prev => (prev && rows.some(b => b.id === prev)) ? prev : (rows[0]?.id ?? null))
      })
      .catch(err => setError(err?.message || 'We could not load your businesses. Please try again.'))
      .finally(() => setLoading(false))
  }, [user, authStatus])

  useEffect(() => { load() }, [load])

  // Reset cached state the moment there's no authenticated user (logout, or
  // session expiry) a second person signing into the same browser must
  // never see the previous customer's businesses, even for a flash.
  useEffect(() => {
    if (!user) {
      setBusinesses([])
      setSelectedBusinessId(null)
    }
  }, [user])

  const selectedBusiness = useMemo(
    () => businesses.find(b => b.id === selectedBusinessId) || businesses[0] || null,
    [businesses, selectedBusinessId]
  )

  const value = useMemo(() => ({
    businesses,
    loading,
    error,
    refetch: load,
    selectedBusinessId: selectedBusiness?.id ?? null,
    selectedBusiness,
    setSelectedBusinessId,
  }), [businesses, loading, error, load, selectedBusiness])

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export const useBusiness = () => useContext(BusinessContext)
