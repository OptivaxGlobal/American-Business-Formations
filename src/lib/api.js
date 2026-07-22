const API_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  health: () => request('/health'),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  submitLead: (payload) => request('/leads', { method: 'POST', body: JSON.stringify(payload) }),
  submitOnboarding: (payload) => request('/onboarding', { method: 'POST', body: JSON.stringify(payload) }),
  submitBoarding: (payload) => request('/boarding', { method: 'POST', body: JSON.stringify(payload) }),
  generateAI: (payload) => request('/ai/generate', { method: 'POST', body: JSON.stringify(payload) }),
  dashboard: () => request('/dashboard')
}

export async function withLocalFallback(action, fallback) {
  try {
    return await action()
  } catch (error) {
    return fallback(error)
  }
}
