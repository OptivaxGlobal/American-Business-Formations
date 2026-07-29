import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { BusinessProvider } from '../context/BusinessContext'
import { OrdersProvider } from '../context/OrdersContext'

export function AllProviders({ children, initialEntries = ['/'] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AppProvider>
        <BusinessProvider>
          <OrdersProvider>{children}</OrdersProvider>
        </BusinessProvider>
      </AppProvider>
    </MemoryRouter>
  )
}
