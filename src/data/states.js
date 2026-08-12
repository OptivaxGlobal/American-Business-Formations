// Single source of truth for every state American Business Formations
// supports for LLC formation and business-address services (Virtual Office
// / Mail Forwarding). Mirrored on the backend at
// server/app/services/states.py — the backend copy is authoritative for
// anything that affects a real charge (checkout.py always recalculates
// server-side; nothing here is ever trusted from the browser). Keep the two
// files in sync by hand when a fee changes; there is no shared build step
// between the Python and JS layers in this project.
//
// `llcFormationFee` is the STANDARD, REQUIRED government fee to file the
// formation document for a new domestic LLC (Articles/Certificate of
// Organization or Formation) only. It deliberately excludes optional costs
// (expedited processing, certified copies, name reservations, publication)
// and ongoing costs (annual/biennial reports, franchise tax, renewal fees)
// — those are called out separately in `note` where a state has one worth
// flagging. Every fee below was checked against that state's own filing
// authority (never a third-party aggregator) as of `verifiedDate`. Filing
// fees are government-set and can change without notice — re-verify before
// trusting an old date for a real order.
export const states = {
  AZ: {
    name: 'Arizona', code: 'AZ', supported: true,
    llcFormationFee: 50,
    filingAuthority: 'Arizona Corporation Commission',
    sourceUrl: 'https://azcc.gov/',
    verifiedDate: '2026-08-06',
    note: null
  },
  CA: {
    name: 'California', code: 'CA', supported: true,
    llcFormationFee: 70,
    filingAuthority: 'California Secretary of State',
    sourceUrl: 'https://bizfileonline.sos.ca.gov/',
    verifiedDate: '2026-08-06',
    note: 'California also requires an $800 annual minimum franchise tax and a biennial Statement of Information filing not part of the initial filing fee.'
  },
  CO: {
    name: 'Colorado', code: 'CO', supported: true,
    llcFormationFee: 50,
    filingAuthority: 'Colorado Secretary of State',
    sourceUrl: 'https://www.coloradosos.gov/',
    verifiedDate: '2026-08-06',
    note: 'Colorado requires a $25 annual Periodic Report not part of the initial filing fee.'
  },
  DE: {
    name: 'Delaware', code: 'DE', supported: true,
    llcFormationFee: 110,
    filingAuthority: 'Delaware Division of Corporations',
    sourceUrl: 'https://corp.delaware.gov/',
    verifiedDate: '2026-08-06',
    note: 'Delaware requires an annual $300 LLC franchise tax not part of the initial filing fee.'
  },
  FL: {
    name: 'Florida', code: 'FL', supported: true,
    llcFormationFee: 125,
    filingAuthority: 'Florida Division of Corporations (Sunbiz)',
    sourceUrl: 'https://dos.fl.gov/sunbiz/',
    verifiedDate: '2026-08-06',
    note: 'Includes Florida’s required $25 registered agent designation fee bundled into the standard $125 filing total.'
  },
  GA: {
    name: 'Georgia', code: 'GA', supported: true,
    llcFormationFee: 110,
    filingAuthority: 'Georgia Secretary of State',
    sourceUrl: 'https://sos.ga.gov/',
    verifiedDate: '2026-08-06',
    note: 'Includes Georgia’s standard $10 filing service charge on top of the $100 base fee.'
  },
  ID: {
    name: 'Idaho', code: 'ID', supported: true,
    llcFormationFee: 100,
    filingAuthority: 'Idaho Secretary of State',
    sourceUrl: 'https://sos.idaho.gov/',
    verifiedDate: '2026-08-06',
    note: 'Online filing fee; mail/in-person filing carries an additional processing charge.'
  },
  IL: {
    name: 'Illinois', code: 'IL', supported: true,
    llcFormationFee: 150,
    filingAuthority: 'Illinois Secretary of State',
    sourceUrl: 'https://www.ilsos.gov/',
    verifiedDate: '2026-08-06',
    note: null
  },
  IA: {
    name: 'Iowa', code: 'IA', supported: true,
    llcFormationFee: 50,
    filingAuthority: 'Iowa Secretary of State',
    sourceUrl: 'https://sos.iowa.gov/',
    verifiedDate: '2026-08-06',
    note: null
  },
  MT: {
    name: 'Montana', code: 'MT', supported: true,
    llcFormationFee: 35,
    filingAuthority: 'Montana Secretary of State',
    sourceUrl: 'https://sosmt.gov/',
    verifiedDate: '2026-08-06',
    note: 'Montana requires a $20 annual report not part of the initial filing fee.'
  },
  NV: {
    name: 'Nevada', code: 'NV', supported: true,
    llcFormationFee: 75,
    filingAuthority: 'Nevada Secretary of State',
    sourceUrl: 'https://www.nvsos.gov/',
    verifiedDate: '2026-08-06',
    note: 'Nevada also requires an initial list of managers/members and a state business license, filed separately from the formation document.'
  },
  NH: {
    name: 'New Hampshire', code: 'NH', supported: true,
    llcFormationFee: 100,
    filingAuthority: 'New Hampshire Secretary of State',
    sourceUrl: 'https://www.sos.nh.gov/',
    verifiedDate: '2026-08-06',
    note: null
  },
  NJ: {
    name: 'New Jersey', code: 'NJ', supported: true,
    llcFormationFee: 100,
    filingAuthority: 'New Jersey Division of Revenue and Enterprise Services',
    sourceUrl: 'https://www.nj.gov/treasury/revenue/',
    verifiedDate: '2026-08-06',
    note: null
  },
  NM: {
    name: 'New Mexico', code: 'NM', supported: true,
    llcFormationFee: 50,
    filingAuthority: 'New Mexico Secretary of State',
    sourceUrl: 'https://www.sos.nm.gov/',
    verifiedDate: '2026-08-06',
    note: null
  },
  NY: {
    name: 'New York', code: 'NY', supported: true,
    llcFormationFee: 200,
    filingAuthority: 'New York Department of State, Division of Corporations',
    sourceUrl: 'https://dos.ny.gov/',
    verifiedDate: '2026-08-06',
    note: 'New York requires a statutory publication requirement within 120 days of formation, with costs that vary significantly by county not part of the initial filing fee.'
  },
  OR: {
    name: 'Oregon', code: 'OR', supported: true,
    llcFormationFee: 100,
    filingAuthority: 'Oregon Secretary of State',
    sourceUrl: 'https://sos.oregon.gov/',
    verifiedDate: '2026-08-06',
    note: 'Oregon requires a $100 annual report not part of the initial filing fee.'
  },
  TX: {
    name: 'Texas', code: 'TX', supported: true,
    llcFormationFee: 300,
    filingAuthority: 'Texas Secretary of State',
    sourceUrl: 'https://www.sos.state.tx.us/',
    verifiedDate: '2026-08-06',
    note: null
  },
  UT: {
    name: 'Utah', code: 'UT', supported: true,
    llcFormationFee: 59,
    filingAuthority: 'Utah Division of Corporations and Commercial Code',
    sourceUrl: 'https://corporations.utah.gov/',
    verifiedDate: '2026-08-06',
    note: null
  },
  VA: {
    name: 'Virginia', code: 'VA', supported: true,
    llcFormationFee: 100,
    filingAuthority: 'Virginia State Corporation Commission',
    sourceUrl: 'https://www.scc.virginia.gov/',
    verifiedDate: '2026-08-06',
    note: 'Virginia requires a $50 annual registration fee not part of the initial filing fee.'
  },
  WA: {
    name: 'Washington', code: 'WA', supported: true,
    llcFormationFee: 180,
    filingAuthority: 'Washington Secretary of State',
    sourceUrl: 'https://www.sos.wa.gov/',
    verifiedDate: '2026-08-06',
    note: null
  },
  WY: {
    name: 'Wyoming', code: 'WY', supported: true,
    llcFormationFee: 100,
    filingAuthority: 'Wyoming Secretary of State',
    sourceUrl: 'https://sos.wyo.gov/',
    verifiedDate: '2026-08-06',
    note: null
  }
}

// Ordered list for dropdowns/selectors — alphabetical by full state name.
export const stateList = Object.values(states)
  .filter(s => s.supported)
  .sort((a, b) => a.name.localeCompare(b.name))

export function getState(code) {
  return code ? states[code.toUpperCase()] || null : null
}

export function isSupportedState(code) {
  return Boolean(getState(code)?.supported)
}

export function getStateFilingFee(code) {
  return getState(code)?.llcFormationFee ?? null
}

// Used by marketing pages that need to describe the fee range across every
// supported state without picking one state as a default example.
export function getFilingFeeRange() {
  const fees = stateList.map(s => s.llcFormationFee)
  return { min: Math.min(...fees), max: Math.max(...fees) }
}

export const STATE_FEE_DISCLAIMER = 'State filing fees are government charges and may change. Additional state-specific requirements, annual reports, franchise taxes, publication costs, or other fees may apply beyond the initial filing fee shown here.'
