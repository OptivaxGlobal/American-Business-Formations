// Lightweight local lead tracking so the admin Leads screen has something
// real to show in this demo. A production backend should be the source of
// truth (see POST /api/leads in server/app.py) this local store exists so
// the admin UI stays useful even when the Flask API isn't running.
const KEY = 'abf-leads'

export function recordLead(source, data = {}) {
  let existing = []
  try { existing = JSON.parse(localStorage.getItem(KEY)) || [] } catch { /* ignore */ }
  const lead = {
    id: `lead-${Date.now()}`,
    source,
    status: 'new',
    createdAt: new Date().toISOString(),
    ...data
  }
  const next = [lead, ...existing].slice(0, 300)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
  return lead
}

export function readLeads() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export function updateLeadStatus(id, status) {
  const next = readLeads().map(l => l.id === id ? { ...l, status } : l)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
  return next
}
