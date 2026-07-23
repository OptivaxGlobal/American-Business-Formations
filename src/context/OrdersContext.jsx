import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const OrdersContext = createContext(null)

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export function OrdersProvider({ children }) {
  const [cart, setCart] = useState(() => load('abf-cart', []))
  const [orders, setOrders] = useState(() => load('abf-orders', []))

  useEffect(() => { localStorage.setItem('abf-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('abf-orders', JSON.stringify(orders)) }, [orders])

  const addToCart = (item) => setCart(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item])
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))
  const clearCart = () => setCart([])

  const cartTotals = useMemo(() => {
    const serviceFees = cart.filter(i => i.type === 'service' || i.type === 'plan').reduce((s, i) => s + (i.price || 0), 0)
    const stateFees = cart.filter(i => i.type === 'state-fee').reduce((s, i) => s + (i.price || 0), 0)
    const addOns = cart.filter(i => i.type === 'add-on').reduce((s, i) => s + (i.price || 0), 0)
    return { serviceFees, stateFees, addOns, total: serviceFees + stateFees + addOns }
  }, [cart])

  // Mock checkout only — no real payment processor is connected. An order is
  // recorded locally as "paid" for demo purposes; a real integration must
  // verify payment via a signed server-side webhook before marking anything paid.
  const checkout = (businessId) => {
    const order = {
      id: `ord-${Date.now()}`,
      businessId,
      items: cart,
      ...cartTotals,
      status: 'paid',
      createdAt: new Date().toISOString()
    }
    setOrders(prev => [...prev, order])
    clearCart()
    return order
  }

  const ordersForBusiness = (businessId) => orders.filter(o => o.businessId === businessId)

  const value = useMemo(() => ({
    cart, addToCart, removeFromCart, clearCart, cartTotals,
    orders, checkout, ordersForBusiness
  }), [cart, cartTotals, orders])

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export const useOrders = () => useContext(OrdersContext)
