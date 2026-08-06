import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useApp } from './AppContext'

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const { user, authStatus } = useApp()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    // See BusinessContext.jsx's identical guard: wait for the real /auth/me
    // check to resolve before flipping `loading` to false, otherwise a
    // descendant page can see `loading: false, orders: []` for one commit
    // right as auth resolves, before the real fetch below has run.
    if (authStatus === 'loading') return
    if (!user) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    api.listOrders()
      .then(result => setOrders(result?.data || []))
      .catch(err => setError(err?.message || 'We could not load your orders. Please try again.'))
      .finally(() => setLoading(false))
  }, [user, authStatus])

  useEffect(() => { load() }, [load])

  // Same reset-on-logout guarantee as BusinessContext never let a second
  // person on the same browser see the previous customer's orders.
  useEffect(() => {
    if (!user) setOrders([])
  }, [user])

  const ordersForBusiness = (businessId) => orders.filter(o => o.business_id === businessId)

  const value = useMemo(() => ({
    orders, loading, error, refetch: load, ordersForBusiness,
  }), [orders, loading, error, load])

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export const useOrders = () => useContext(OrdersContext)
