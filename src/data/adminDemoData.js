// Seed data for the admin portal demo. These are placeholder records so the
// admin UI has something to display before any real customer has used the
// site in this browser — they are clearly not real customers and must never
// be shown on customer-facing pages.

export const sampleCustomers = [
  { id: 'cust-demo-1', name: 'Demo Customer — Priya N.', email: 'demo1@example.com', businesses: 1, joinedAt: '2026-06-02T00:00:00.000Z' },
  { id: 'cust-demo-2', name: 'Demo Customer — Marcus T.', email: 'demo2@example.com', businesses: 2, joinedAt: '2026-06-14T00:00:00.000Z' },
  { id: 'cust-demo-3', name: 'Demo Customer — Elena R.', email: 'demo3@example.com', businesses: 1, joinedAt: '2026-07-01T00:00:00.000Z' }
]

export const sampleApplications = [
  { id: 'app-demo-1', businessName: 'Northwind Consulting LLC (demo)', state: 'Wyoming', entityType: 'LLC', status: 'under-review', createdAt: '2026-07-10T00:00:00.000Z' },
  { id: 'app-demo-2', businessName: 'Harborline Goods Co (demo)', state: 'Delaware', entityType: 'C Corporation', status: 'ready-to-file', createdAt: '2026-07-14T00:00:00.000Z' },
  { id: 'app-demo-3', businessName: 'Bright Path Studio (demo)', state: 'Texas', entityType: 'LLC', status: 'approved', createdAt: '2026-06-28T00:00:00.000Z' }
]

export const sampleTickets = [
  { id: 'tkt-demo-1', subject: 'Question about registered agent renewal (demo)', priority: 'normal', status: 'open', createdAt: '2026-07-18T00:00:00.000Z' },
  { id: 'tkt-demo-2', subject: 'Need to update mailing address (demo)', priority: 'low', status: 'open', createdAt: '2026-07-19T00:00:00.000Z' }
]

export const applicationStatuses = [
  'draft', 'submitted', 'under-review', 'info-requested', 'ready-to-file',
  'submitted-to-state', 'approved', 'rejected'
]
