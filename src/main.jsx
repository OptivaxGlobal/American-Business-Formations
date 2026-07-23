import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import { BusinessProvider } from './context/BusinessContext'
import { OrdersProvider } from './context/OrdersContext'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <BusinessProvider>
          <OrdersProvider>
            <App/>
          </OrdersProvider>
        </BusinessProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
