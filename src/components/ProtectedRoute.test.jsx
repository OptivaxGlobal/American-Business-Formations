import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AppProvider } from '../context/AppContext'

function renderProtected(initialEntries) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard content</div></ProtectedRoute>} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to login when no user is signed in', () => {
    renderProtected(['/dashboard'])
    expect(screen.getByText(/login page/i)).toBeInTheDocument()
    expect(screen.queryByText(/dashboard content/i)).not.toBeInTheDocument()
  })

  it('renders the protected content when a user is signed in', () => {
    localStorage.setItem('abf-user', JSON.stringify({ name: 'Jordan', email: 'jordan@example.com', role: 'customer' }))
    renderProtected(['/dashboard'])
    expect(screen.getByText(/dashboard content/i)).toBeInTheDocument()
  })
})
