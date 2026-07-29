const API_URL = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {}, isNetworkError = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.isNetworkError = isNetworkError
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    })
  } catch {
    throw new ApiError('We could not reach the server. Please try again.', { isNetworkError: true })
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed', { status: response.status, fieldErrors: data.field_errors || {} })
  }
  return data
}

export const api = {
  health: () => request('/health'),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  submitContact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  submitLead: (payload) => request('/leads', { method: 'POST', body: JSON.stringify(payload) }),
  submitOnboarding: (payload) => request('/onboarding', { method: 'POST', body: JSON.stringify(payload) }),
  submitBoarding: (payload) => request('/boarding', { method: 'POST', body: JSON.stringify(payload) }),
  generateAI: (payload) => request('/ai/generate', { method: 'POST', body: JSON.stringify(payload) }),
  dashboard: () => request('/dashboard')
}

// Falls back to local/demo behavior only when the backend is genuinely
// unreachable (network error), erroring (5xx), or the route doesn't exist
// yet (404 e.g. /api/onboarding). A real validation/business-logic
// rejection (400/401/409/422) is NEVER swallowed it must reach the caller
// so the user sees the actual problem instead of a false "success".
export async function withLocalFallback(action, fallback) {
  try {
    return await action()
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 0
    const isNetworkOrMissing = !(err instanceof ApiError) || err.isNetworkError || status === 404 || status >= 500
    if (!isNetworkOrMissing) throw err
    return fallback(err)
  }
}
