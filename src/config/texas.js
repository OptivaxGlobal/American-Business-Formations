// Central Texas configuration.
//
// This is the single source of truth for Texas-specific business-formation
// facts used across the marketing site, onboarding wizard, and dashboards.
// The platform currently supports Texas only; adding another state later
// means creating a sibling config module and wiring a state switch here —
// no other part of the app should hardcode Texas facts directly.
//
// IMPORTANT: `filingFee` and the processing-time estimates are
// owner-configurable placeholders, not verified figures. Confirm current
// amounts and requirements against the Texas Secretary of State and Texas
// Comptroller before relying on them for customer-facing pricing or filings.

function loadOverrides() {
  try {
    const raw = localStorage.getItem('abf-admin-texas-config')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const base = {
  name: 'Texas',
  abbreviation: 'TX',
  entityTerm: 'LLC',
  filingDocumentName: 'Certificate of Formation',
  filingFormNumber: 'Form 205',
  filingFee: Number(import.meta.env.VITE_TX_FILING_FEE) || 300,
  filingFeeVerified: false,
  expeditedFee: 25,
  processingTimeStandard: '3–5 business days (standard processing, sample estimate)',
  processingTimeExpedited: '1–2 business days (expedited processing, sample estimate)',
  processingTimeVerified: false,
  franchiseTaxNoTaxDueThreshold: null, // owner to confirm current Comptroller threshold before display
  registeredAgent: {
    requiresConsent: true,
    allowsPoBoxOnly: false,
    mustBeTexasStreetAddress: true,
    eligibleTypes: ['Texas resident individual', 'Business entity authorized to do business in Texas']
  },
  requiredFormationFields: [
    'proposedName', 'entityType', 'businessPurpose', 'registeredAgentType', 'registeredAgentName',
    'registeredOfficeAddress', 'managementStructure', 'governingPersons', 'organizer',
    'principalAddress', 'effectiveDateOption'
  ],
  complianceTasks: [
    {
      id: 'public-information-report',
      name: 'Texas Public Information Report',
      agency: 'Texas Comptroller of Public Accounts',
      frequency: 'Annual, filed alongside the franchise tax report (due May 15)',
      description: 'Confirms and updates the LLC’s registered agent, registered office, and governing persons on file with the state.'
    },
    {
      id: 'franchise-tax',
      name: 'Texas Franchise Tax',
      agency: 'Texas Comptroller of Public Accounts',
      frequency: 'Annual (due May 15)',
      description: 'A privilege tax for doing business in Texas. Many small entities owe no tax but generally still must file a report; confirm your obligation with the Comptroller or a tax professional.'
    },
    {
      id: 'registered-agent-renewal',
      name: 'Registered Agent Service Renewal',
      agency: 'American Business Formations',
      frequency: 'Annual',
      description: 'If American Business Formations serves as your registered agent, this renews that service so your business keeps a continuous point of contact for official notices.'
    },
    {
      id: 'sales-tax-filing',
      name: 'Texas Sales and Use Tax Filing',
      agency: 'Texas Comptroller of Public Accounts',
      frequency: 'Monthly, quarterly, or annually, depending on your permit',
      description: 'Applies only if your business holds a Texas Sales Tax Permit and sells taxable goods or services.'
    },
    {
      id: 'annual-review',
      name: 'Internal Annual Business Review',
      agency: 'American Business Formations (self-service)',
      frequency: 'Annual',
      description: 'A once-a-year checkpoint to confirm your registered agent, addresses, ownership records, and licenses are still accurate.'
    }
  ],
  officialResources: [
    { name: 'Texas Secretary of State Business & Nonprofit Filings', url: 'https://www.sos.state.tx.us/corp/index.shtml' },
    { name: 'Texas Comptroller Franchise Tax', url: 'https://comptroller.texas.gov/taxes/franchise/' },
    { name: 'Texas Comptroller Sales and Use Tax', url: 'https://comptroller.texas.gov/taxes/sales/' },
    { name: 'IRS Apply for an EIN', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online' }
  ]
}

export function getTexasConfig() {
  const overrides = loadOverrides()
  return overrides ? { ...base, ...overrides } : base
}

export function saveTexasConfigOverrides(patch) {
  const next = { ...getTexasConfig(), ...patch }
  try { localStorage.setItem('abf-admin-texas-config', JSON.stringify(next)) } catch { /* storage unavailable */ }
  return next
}

export const TEXAS = base
