export function logAudit(actor, action, details = '') {
  const entry = { id: `log-${Date.now()}`, actor, action, details, at: new Date().toISOString() }
  let existing = []
  try { existing = JSON.parse(localStorage.getItem('abf-audit-log')) || [] } catch { /* ignore */ }
  const next = [entry, ...existing].slice(0, 200)
  localStorage.setItem('abf-audit-log', JSON.stringify(next))
  return entry
}

export function readAuditLog() {
  try { return JSON.parse(localStorage.getItem('abf-audit-log')) || [] } catch { return [] }
}
