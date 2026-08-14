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

// Flask-JWT-Extended's cookie mode (JWT_COOKIE_CSRF_PROTECT=True) pairs the
// httpOnly auth cookie with a separate, JS-readable `csrf_access_token`
// cookie. The backend expects that value echoed back as `X-CSRF-TOKEN` on
// any mutating request from a browser that already holds a session —
// without it, jwt_required() routes reject the request even though the
// auth cookie itself is present. GET requests never need it.
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function csrfHeaders(method) {
  if (method === 'GET' || method === undefined) return {}
  const token = getCookie('csrf_access_token')
  return token ? { 'X-CSRF-TOKEN': token } : {}
}

async function handleResponse(response) {
  // A hosting/CDN rewrite (or a misconfigured VITE_API_URL) can make a
  // "successful" 200 response come back as the SPA's own index.html
  // instead of real API JSON. Treat that exactly like an unreachable
  // backend rather than trusting an empty/garbage body as real data.
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    // Diagnostic breadcrumb only never shown to the user, never changes
    // the thrown error. This exact failure mode (a 200 HTML page instead
    // of JSON) has a real, recurring cause worth naming directly in the
    // console: VITE_API_URL pointing at a host with no backend behind it,
    // or a hosting rewrite rule (.htaccess/CDN) swallowing /api/* into the
    // SPA shell before it ever reaches the backend.
    console.error(
      `[api] ${response.url} returned "${contentType || '(no content-type)'}" (status ${response.status}) instead of JSON. ` +
      'This usually means the request never reached the Flask backend check VITE_API_URL and any .htaccess/CDN rewrite rules for an /api exclusion.'
    )
    throw new ApiError('We could not reach the server. Please try again.', { isNetworkError: true })
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed', { status: response.status, fieldErrors: data.field_errors || {} })
  }
  return data
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders(options.method),
        ...(options.headers || {})
      },
      ...options
    })
  } catch {
    throw new ApiError('We could not reach the server. Please try again.', { isNetworkError: true })
  }
  return handleResponse(response)
}

// For file uploads: omits Content-Type so the browser sets the multipart
// boundary itself, but keeps the same credentials/CSRF/error handling as
// request() above.
async function requestMultipart(path, formData, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...csrfHeaders('POST'), ...(options.headers || {}) },
      body: formData,
      ...options
    })
  } catch {
    throw new ApiError('We could not reach the server. Please try again.', { isNetworkError: true })
  }
  return handleResponse(response)
}

export const api = {
  health: () => request('/health'),
  me: () => request('/auth/me'),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  submitContact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  submitLead: (payload) => request('/leads', { method: 'POST', body: JSON.stringify(payload) }),
  generateAI: (payload) => request('/ai/generate', { method: 'POST', body: JSON.stringify(payload) }),
  dashboard: () => request('/dashboard'),
  uploadDocument: (path, formData) => requestMultipart(path, formData),

  // Onboarding / formation application (server/app/api/applications.py).
  // Autosave and the final submit both go through these two routes —
  // there is no separate "/api/onboarding" endpoint.
  saveApplication: (payload) => request('/applications', { method: 'POST', body: JSON.stringify(payload) }),
  listBusinesses: () => request('/applications'),
  getApplication: (businessId) => request(`/applications/${businessId}`),
  submitApplication: (businessId) => request(`/applications/${businessId}/submit`, { method: 'POST' }),

  // Checkout / orders (server/app/api/checkout.py, orders.py). The request
  // only ever carries identifiers (business_id, package_id, add_on_ids) —
  // pricing is always calculated server-side from the catalog below.
  createCheckoutSession: (payload) => request('/checkout/session', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (orderId) => request(`/orders/${orderId}`),
  listOrders: () => request('/orders'),

  // Server-side catalog (server/app/api/catalog.py) not yet consumed by
  // the frontend (which still shows its own hardcoded catalog for a snappy
  // marketing-page UX; see docs/part-3-handoff.md), but available for a
  // future fully-dynamic pricing pass.
  getPackages: () => request('/packages'),
  getAddOns: () => request('/add-ons'),
  getTexasConfig: () => request('/texas-config'),
  // Every state's real LLC formation filing fee (server/app/services/states.py)
  // the same data checkout.py actually prices orders from.
  getStates: () => request('/states'),
  getTestimonials: () => request('/testimonials'),
  getAnnouncement: () => request('/announcement'),

  // Account / profile (server/app/api/account.py). role/is_active/id are
  // never accepted by these endpoints server-side, so there is nothing a
  // crafted payload here could do to escalate privileges.
  updateProfile: (payload) => request('/account/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  updateEmail: (email) => request('/account/email', { method: 'PATCH', body: JSON.stringify({ email }) }),
  changePassword: (payload) => request('/account/password', { method: 'POST', body: JSON.stringify(payload) }),

  // Documents (server/app/api/documents.py).
  listDocuments: (businessId) => request(`/documents/${businessId}`),
  documentDownloadUrl: (businessId, documentId) => `${API_URL}/documents/${businessId}/${documentId}/download`,
  deleteDocument: (businessId, documentId) => request(`/documents/${businessId}/${documentId}`, { method: 'DELETE' }),
  // Staff/admin document review (Part 24) server-side @admin_required;
  // a non-admin JWT gets a real 403 regardless of what the frontend renders.
  adminUpdateDocumentStatus: (businessId, documentId, payload) => request(`/documents/${businessId}/${documentId}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  // Formation review acknowledgement (Part 16) is not a separate call —
  // formation_review_approved/formation_review_version ride along on the
  // normal saveApplication() autosave (see buildApplicationPayload in
  // useOnboardingWizard.js) and server/app/api/applications.py records the
  // confirmation timestamp the moment it sees `formation_review_approved`.

  // Compliance tasks (server/app/api/compliance.py).
  listComplianceTasks: (businessId) => request(`/compliance/${businessId}`),
  seedComplianceTasks: (businessId) => request(`/compliance/${businessId}/seed`, { method: 'POST' }),
  updateComplianceTask: (businessId, taskId, payload) => request(`/compliance/${businessId}/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Support (server/app/api/support.py).
  listSupportThreads: () => request('/support/threads'),
  getSupportThread: (threadId) => request(`/support/threads/${threadId}`),
  createSupportThread: (payload) => request('/support/threads', { method: 'POST', body: JSON.stringify(payload) }),
  replyToThread: (threadId, payload) => request(`/support/threads/${threadId}/messages`, { method: 'POST', body: JSON.stringify(payload) }),

  // Notifications (server/app/api/notifications.py).
  listNotifications: () => request('/notifications'),
  markNotificationRead: (notificationId) => request(`/notifications/${notificationId}/read`, { method: 'POST' }),

  // Admin (server/app/admin/routes.py) every route below is
  // @admin_required server-side; a non-admin JWT gets a real 403 no
  // matter what the frontend renders.
  adminOverview: () => request('/admin/overview'),
  adminListLeads: () => request('/admin/leads'),
  adminUpdateLead: (leadId, payload) => request(`/admin/leads/${leadId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  adminListApplications: () => request('/admin/applications'),
  adminUpdateApplicationStatus: (businessId, status) => request(`/admin/applications/${businessId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminListCustomers: () => request('/admin/customers'),
  adminListOrders: () => request('/admin/orders'),
  adminListPlans: () => request('/admin/plans'),
  adminUpdatePackage: (packageId, payload) => request(`/admin/plans/packages/${packageId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  adminUpdateAddOn: (addOnId, payload) => request(`/admin/plans/add-ons/${addOnId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  adminGetPaymentStatus: () => request('/admin/payment-status'),
  adminRecordOfflinePayment: (orderId, payload) => request(`/admin/orders/${orderId}/record-offline-payment`, { method: 'POST', body: JSON.stringify(payload) }),
  adminListSupportThreads: () => request('/admin/support/threads'),
  adminGetSupportThread: (threadId) => request(`/admin/support/threads/${threadId}`),
  adminReplyToThread: (threadId, payload) => request(`/admin/support/threads/${threadId}/messages`, { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateThreadStatus: (threadId, status) => request(`/admin/support/threads/${threadId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminGetSiteSettings: () => request('/admin/content/site-settings'),
  adminSetSiteSetting: (key, value) => request(`/admin/content/site-settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  adminListTestimonials: () => request('/admin/content/testimonials'),
  adminCreateTestimonial: (payload) => request('/admin/content/testimonials', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateTestimonial: (id, payload) => request(`/admin/content/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  adminDeleteTestimonial: (id) => request(`/admin/content/testimonials/${id}`, { method: 'DELETE' }),
  adminListFaqs: () => request('/admin/content/faqs'),
  adminAuditLog: () => request('/admin/audit-log')
}
