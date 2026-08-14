// Single source of truth for every jurisdiction American Business
// Formations supports for LLC Formation and Registered Agent service —
// all 50 states plus Washington, D.C. and Puerto Rico (52 total, as of the
// 2026-08-13 nationwide expansion). Mirrored on the backend at
// server/app/services/states.py the backend copy is authoritative for
// anything that affects a real charge (checkout.py always recalculates
// server-side; nothing here is ever trusted from the browser). Keep the two
// files in sync by hand when a fee changes; there is no shared build step
// between the Python and JS layers in this project.
//
// IMPORTANT: this file is NOT also the Virtual Office availability list.
// Virtual Office deliberately stayed at its original 21-state footprint
// when LLC Formation/Registered Agent expanded nationwide see
// `VIRTUAL_OFFICE_STATE_CODES`/`isVirtualOfficeAvailable` below, a
// genuinely separate list, never derived from `states`/`stateList`.
//
// `llcFormationFee` is the STANDARD, REQUIRED government fee to file the
// formation document for a new domestic LLC (Articles/Certificate of
// Organization or Formation) only. It deliberately excludes optional costs
// (expedited processing, certified copies, name reservations, publication)
// and ongoing costs (annual/biennial reports, franchise tax, renewal fees)
// those are called out separately in `note` where a state has one worth
// flagging. Every fee below was checked against that jurisdiction's own
// filing authority (never a third-party aggregator) as of `verifiedDate`.
// Filing fees are government-set and can change without notice re-verify
// before trusting an old date for a real order. A small number of items
// are flagged "Needs Review" in `note` rather than guessed see
// docs/nationwide-expansion-audit.md for the consolidated list.
//
// `jurisdictionType`: 'state' | 'district' | 'territory'. Washington, D.C.
// and Puerto Rico are not states see Part 14 of the nationwide-expansion
// spec so customer-facing copy should say "state or jurisdiction" where
// it might otherwise incorrectly call every entry here a "state".
export const states = {
  AL: { name: 'Alabama', code: 'AL', jurisdictionType: 'state', supported: true, llcFormationFee: 200, filingAuthority: 'Alabama Secretary of State', sourceUrl: 'https://www.sos.alabama.gov/business-entities/llcs', verifiedDate: '2026-08-13', note: 'Alabama also requires a one-time Name Reservation ($25) before filing, and an initial Business Privilege Tax Return not part of the initial filing fee.' },
  AK: { name: 'Alaska', code: 'AK', jurisdictionType: 'state', supported: true, llcFormationFee: 250, filingAuthority: 'Alaska Division of Corporations, Business and Professional Licensing', sourceUrl: 'https://www.commerce.alaska.gov/web/cbpl/', verifiedDate: '2026-08-13', note: null },
  AZ: { name: 'Arizona', code: 'AZ', jurisdictionType: 'state', supported: true, llcFormationFee: 50, filingAuthority: 'Arizona Corporation Commission', sourceUrl: 'https://azcc.gov/', verifiedDate: '2026-08-06', note: null },
  AR: { name: 'Arkansas', code: 'AR', jurisdictionType: 'state', supported: true, llcFormationFee: 45, filingAuthority: 'Arkansas Secretary of State', sourceUrl: 'https://www.sos.arkansas.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $50 not part of the initial filing fee shown here.' },
  CA: { name: 'California', code: 'CA', jurisdictionType: 'state', supported: true, llcFormationFee: 70, filingAuthority: 'California Secretary of State', sourceUrl: 'https://bizfileonline.sos.ca.gov/', verifiedDate: '2026-08-06', note: 'California also requires an $800 annual minimum franchise tax and a biennial Statement of Information filing not part of the initial filing fee.' },
  CO: { name: 'Colorado', code: 'CO', jurisdictionType: 'state', supported: true, llcFormationFee: 50, filingAuthority: 'Colorado Secretary of State', sourceUrl: 'https://www.coloradosos.gov/', verifiedDate: '2026-08-06', note: 'Colorado requires a $25 annual Periodic Report not part of the initial filing fee.' },
  CT: { name: 'Connecticut', code: 'CT', jurisdictionType: 'state', supported: true, llcFormationFee: 120, filingAuthority: 'Connecticut Secretary of the State', sourceUrl: 'https://portal.ct.gov/sots', verifiedDate: '2026-08-13', note: null },
  DE: { name: 'Delaware', code: 'DE', jurisdictionType: 'state', supported: true, llcFormationFee: 110, filingAuthority: 'Delaware Division of Corporations', sourceUrl: 'https://corp.delaware.gov/', verifiedDate: '2026-08-06', note: 'Delaware requires an annual $300 LLC franchise tax not part of the initial filing fee.' },
  FL: { name: 'Florida', code: 'FL', jurisdictionType: 'state', supported: true, llcFormationFee: 125, filingAuthority: 'Florida Division of Corporations (Sunbiz)', sourceUrl: 'https://dos.fl.gov/sunbiz/', verifiedDate: '2026-08-06', note: 'Includes Florida’s required $25 registered agent designation fee bundled into the standard $125 filing total.' },
  GA: { name: 'Georgia', code: 'GA', jurisdictionType: 'state', supported: true, llcFormationFee: 110, filingAuthority: 'Georgia Secretary of State', sourceUrl: 'https://sos.ga.gov/', verifiedDate: '2026-08-06', note: 'Includes Georgia’s standard $10 filing service charge on top of the $100 base fee.' },
  HI: { name: 'Hawaii', code: 'HI', jurisdictionType: 'state', supported: true, llcFormationFee: 50, filingAuthority: 'Hawaii Department of Commerce and Consumer Affairs, Business Registration Division', sourceUrl: 'https://cca.hawaii.gov/breg/', verifiedDate: '2026-08-13', note: 'Includes Hawaii’s $1 State Archives fee.' },
  ID: { name: 'Idaho', code: 'ID', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'Idaho Secretary of State', sourceUrl: 'https://sos.idaho.gov/', verifiedDate: '2026-08-06', note: 'Online filing fee; mail/in-person filing carries an additional processing charge.' },
  IL: { name: 'Illinois', code: 'IL', jurisdictionType: 'state', supported: true, llcFormationFee: 150, filingAuthority: 'Illinois Secretary of State', sourceUrl: 'https://www.ilsos.gov/', verifiedDate: '2026-08-06', note: null },
  IN: { name: 'Indiana', code: 'IN', jurisdictionType: 'state', supported: true, llcFormationFee: 95, filingAuthority: 'Indiana Secretary of State', sourceUrl: 'https://inbiz.in.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $100.' },
  IA: { name: 'Iowa', code: 'IA', jurisdictionType: 'state', supported: true, llcFormationFee: 50, filingAuthority: 'Iowa Secretary of State', sourceUrl: 'https://sos.iowa.gov/', verifiedDate: '2026-08-06', note: null },
  KS: { name: 'Kansas', code: 'KS', jurisdictionType: 'state', supported: true, llcFormationFee: 85, filingAuthority: 'Kansas Secretary of State', sourceUrl: 'https://sos.ks.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $90.' },
  KY: { name: 'Kentucky', code: 'KY', jurisdictionType: 'state', supported: true, llcFormationFee: 40, filingAuthority: 'Kentucky Secretary of State', sourceUrl: 'https://sos.ky.gov/', verifiedDate: '2026-08-13', note: null },
  LA: { name: 'Louisiana', code: 'LA', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'Louisiana Secretary of State', sourceUrl: 'https://www.sos.la.gov/', verifiedDate: '2026-08-13', note: 'An Initial Report must be filed together with the Articles of Organization at no extra charge.' },
  ME: { name: 'Maine', code: 'ME', jurisdictionType: 'state', supported: true, llcFormationFee: 175, filingAuthority: 'Maine Secretary of State, Bureau of Corporations', sourceUrl: 'https://www.maine.gov/sos/', verifiedDate: '2026-08-13', note: 'Maine does not currently offer online filing for this document mail or in-person only.' },
  MD: { name: 'Maryland', code: 'MD', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'Maryland Department of Assessments and Taxation', sourceUrl: 'https://dat.maryland.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $170.' },
  MA: { name: 'Massachusetts', code: 'MA', jurisdictionType: 'state', supported: true, llcFormationFee: 500, filingAuthority: 'Massachusetts Secretary of the Commonwealth', sourceUrl: 'https://www.sec.state.ma.us/', verifiedDate: '2026-08-13', note: 'Mail filing fee; online filing carries a $20 state-added surcharge ($520 total). Massachusetts also requires a $500 Annual Report fee not part of the initial filing fee.' },
  MI: { name: 'Michigan', code: 'MI', jurisdictionType: 'state', supported: true, llcFormationFee: 50, filingAuthority: 'Michigan Department of Licensing and Regulatory Affairs (LARA), Corporations Division', sourceUrl: 'https://www.michigan.gov/lara', verifiedDate: '2026-08-13', note: null },
  MN: { name: 'Minnesota', code: 'MN', jurisdictionType: 'state', supported: true, llcFormationFee: 155, filingAuthority: 'Minnesota Secretary of State', sourceUrl: 'https://www.sos.state.mn.us/', verifiedDate: '2026-08-13', note: 'Online/in-person filing fee (treated as expedited); mail filing is $135.' },
  MS: { name: 'Mississippi', code: 'MS', jurisdictionType: 'state', supported: true, llcFormationFee: 50, filingAuthority: 'Mississippi Secretary of State', sourceUrl: 'https://www.sos.ms.gov/', verifiedDate: '2026-08-13', note: null },
  MO: { name: 'Missouri', code: 'MO', jurisdictionType: 'state', supported: true, llcFormationFee: 50, filingAuthority: 'Missouri Secretary of State', sourceUrl: 'https://www.sos.mo.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $105.' },
  MT: { name: 'Montana', code: 'MT', jurisdictionType: 'state', supported: true, llcFormationFee: 35, filingAuthority: 'Montana Secretary of State', sourceUrl: 'https://sosmt.gov/', verifiedDate: '2026-08-06', note: 'Montana requires a $20 annual report not part of the initial filing fee.' },
  NE: { name: 'Nebraska', code: 'NE', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'Nebraska Secretary of State', sourceUrl: 'https://sos.nebraska.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $110. Nebraska also has a statutory publication requirement, similar to New York’s, not part of the initial filing fee.' },
  NV: { name: 'Nevada', code: 'NV', jurisdictionType: 'state', supported: true, llcFormationFee: 75, filingAuthority: 'Nevada Secretary of State', sourceUrl: 'https://www.nvsos.gov/', verifiedDate: '2026-08-06', note: 'Nevada also requires an initial list of managers/members and a state business license, filed separately from the formation document.' },
  NH: { name: 'New Hampshire', code: 'NH', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'New Hampshire Secretary of State', sourceUrl: 'https://www.sos.nh.gov/', verifiedDate: '2026-08-06', note: null },
  NJ: { name: 'New Jersey', code: 'NJ', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'New Jersey Division of Revenue and Enterprise Services', sourceUrl: 'https://www.nj.gov/treasury/revenue/', verifiedDate: '2026-08-06', note: null },
  NM: { name: 'New Mexico', code: 'NM', jurisdictionType: 'state', supported: true, llcFormationFee: 50, filingAuthority: 'New Mexico Secretary of State', sourceUrl: 'https://www.sos.nm.gov/', verifiedDate: '2026-08-06', note: null },
  NY: { name: 'New York', code: 'NY', jurisdictionType: 'state', supported: true, llcFormationFee: 200, filingAuthority: 'New York Department of State, Division of Corporations', sourceUrl: 'https://dos.ny.gov/', verifiedDate: '2026-08-06', note: 'New York requires a statutory publication requirement within 120 days of formation, with costs that vary significantly by county not part of the initial filing fee.' },
  NC: { name: 'North Carolina', code: 'NC', jurisdictionType: 'state', supported: true, llcFormationFee: 125, filingAuthority: 'North Carolina Secretary of State', sourceUrl: 'https://www.sosnc.gov/', verifiedDate: '2026-08-13', note: null },
  ND: { name: 'North Dakota', code: 'ND', jurisdictionType: 'state', supported: true, llcFormationFee: 135, filingAuthority: 'North Dakota Secretary of State', sourceUrl: 'https://sos.nd.gov/', verifiedDate: '2026-08-13', note: null },
  OH: { name: 'Ohio', code: 'OH', jurisdictionType: 'state', supported: true, llcFormationFee: 99, filingAuthority: 'Ohio Secretary of State', sourceUrl: 'https://www.ohiosos.gov/', verifiedDate: '2026-08-13', note: 'Ohio has no recurring annual report or franchise tax for LLCs.' },
  OK: { name: 'Oklahoma', code: 'OK', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'Oklahoma Secretary of State', sourceUrl: 'https://www.sos.ok.gov/', verifiedDate: '2026-08-13', note: null },
  OR: { name: 'Oregon', code: 'OR', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'Oregon Secretary of State', sourceUrl: 'https://sos.oregon.gov/', verifiedDate: '2026-08-06', note: 'Oregon requires a $100 annual report not part of the initial filing fee.' },
  PA: { name: 'Pennsylvania', code: 'PA', jurisdictionType: 'state', supported: true, llcFormationFee: 125, filingAuthority: 'Pennsylvania Department of State, Bureau of Corporations and Charitable Organizations', sourceUrl: 'https://www.pa.gov/agencies/dos.html', verifiedDate: '2026-08-13', note: null },
  RI: { name: 'Rhode Island', code: 'RI', jurisdictionType: 'state', supported: true, llcFormationFee: 150, filingAuthority: 'Rhode Island Department of State, Business Services Division', sourceUrl: 'https://sos.ri.gov/', verifiedDate: '2026-08-13', note: null },
  SC: { name: 'South Carolina', code: 'SC', jurisdictionType: 'state', supported: true, llcFormationFee: 110, filingAuthority: 'South Carolina Secretary of State', sourceUrl: 'https://sos.sc.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $110.' },
  SD: { name: 'South Dakota', code: 'SD', jurisdictionType: 'state', supported: true, llcFormationFee: 150, filingAuthority: 'South Dakota Secretary of State', sourceUrl: 'https://sdsos.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $165.' },
  TN: { name: 'Tennessee', code: 'TN', jurisdictionType: 'state', supported: true, llcFormationFee: 300, filingAuthority: 'Tennessee Secretary of State', sourceUrl: 'https://sos.tn.gov/', verifiedDate: '2026-08-13', note: '$50 per member, $300 minimum, $3,000 maximum $300 shown here covers LLCs with up to 6 members; larger membership increases this fee.' },
  TX: { name: 'Texas', code: 'TX', jurisdictionType: 'state', supported: true, llcFormationFee: 300, filingAuthority: 'Texas Secretary of State', sourceUrl: 'https://www.sos.state.tx.us/', verifiedDate: '2026-08-06', note: null },
  UT: { name: 'Utah', code: 'UT', jurisdictionType: 'state', supported: true, llcFormationFee: 59, filingAuthority: 'Utah Division of Corporations and Commercial Code', sourceUrl: 'https://corporations.utah.gov/', verifiedDate: '2026-08-06', note: null },
  VT: { name: 'Vermont', code: 'VT', jurisdictionType: 'state', supported: true, llcFormationFee: 155, filingAuthority: 'Vermont Secretary of State', sourceUrl: 'https://sos.vermont.gov/', verifiedDate: '2026-08-13', note: null },
  VA: { name: 'Virginia', code: 'VA', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'Virginia State Corporation Commission', sourceUrl: 'https://www.scc.virginia.gov/', verifiedDate: '2026-08-06', note: 'Virginia requires a $50 annual registration fee not part of the initial filing fee.' },
  WA: { name: 'Washington', code: 'WA', jurisdictionType: 'state', supported: true, llcFormationFee: 180, filingAuthority: 'Washington Secretary of State', sourceUrl: 'https://www.sos.wa.gov/', verifiedDate: '2026-08-06', note: null },
  WV: { name: 'West Virginia', code: 'WV', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'West Virginia Secretary of State', sourceUrl: 'https://sos.wv.gov/', verifiedDate: '2026-08-13', note: '$101 if filed online. Needs Review: a small number of sources cite a different figure ($130) confirm against the current official fee schedule before relying on this for a live order.' },
  WI: { name: 'Wisconsin', code: 'WI', jurisdictionType: 'state', supported: true, llcFormationFee: 130, filingAuthority: 'Wisconsin Department of Financial Institutions', sourceUrl: 'https://dfi.wi.gov/', verifiedDate: '2026-08-13', note: 'Online filing fee; paper filing is $170.' },
  WY: { name: 'Wyoming', code: 'WY', jurisdictionType: 'state', supported: true, llcFormationFee: 100, filingAuthority: 'Wyoming Secretary of State', sourceUrl: 'https://sos.wyo.gov/', verifiedDate: '2026-08-06', note: null },
  DC: { name: 'Washington, D.C.', code: 'DC', jurisdictionType: 'district', supported: true, llcFormationFee: 99, filingAuthority: 'DC Department of Licensing and Consumer Protection (DLCP), Corporations Division', sourceUrl: 'https://dlcp.dc.gov/', verifiedDate: '2026-08-13', note: null },
  PR: { name: 'Puerto Rico', code: 'PR', jurisdictionType: 'territory', supported: true, llcFormationFee: 250, filingAuthority: 'Puerto Rico Department of State', sourceUrl: 'https://estado.pr.gov/', verifiedDate: '2026-08-13', note: 'Puerto Rico does not require a separate annual report, but does require a $150 annual fee not part of the initial filing fee.' },
}

// Ordered list for dropdowns/selectors alphabetical by full name. Used
// for both the LLC Formation state selector and the Registered Agent
// selector (Part 9: both cover the same 52 jurisdictions). The Virtual
// Office selector must NOT use this list see stateListForVirtualOffice.
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
// supported jurisdiction without picking one as a default example.
export function getFilingFeeRange() {
  const fees = stateList.map(s => s.llcFormationFee)
  return { min: Math.min(...fees), max: Math.max(...fees) }
}

export const STATE_FEE_DISCLAIMER = 'Government filing fees vary by state or jurisdiction and may change. Additional state-specific requirements, annual reports, franchise taxes, publication costs, or other fees may apply beyond the initial filing fee shown here.'

// --- Virtual Office: a genuinely separate 21-state list (Part 7/8) --------
// Virtual Office was deliberately NOT expanded when LLC Formation and
// Registered Agent went nationwide it keeps its original footprint.
// Never derive this from `states`/`stateList`, and never let a Virtual
// Office selector fall back to the full 52-jurisdiction list.
export const VIRTUAL_OFFICE_STATE_CODES = [
  'AZ', 'CA', 'CO', 'DE', 'FL', 'GA', 'ID', 'IL', 'IA', 'MT', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'OR', 'TX', 'UT', 'VA', 'WA', 'WY',
]
const VIRTUAL_OFFICE_STATE_SET = new Set(VIRTUAL_OFFICE_STATE_CODES)

export function isVirtualOfficeAvailable(code) {
  return Boolean(code) && VIRTUAL_OFFICE_STATE_SET.has(code.toUpperCase())
}

// Ordered list for a Virtual-Office-specific selector/display same shape
// as `stateList` above, but scoped to the 21-state footprint only.
export const virtualOfficeStateList = stateList.filter(s => VIRTUAL_OFFICE_STATE_SET.has(s.code))

export const REGISTERED_AGENT_AVAILABILITY_LABEL = 'Registered Agent service available across all 50 states, Washington, D.C., and Puerto Rico.'
export const LLC_FORMATION_AVAILABILITY_LABEL = 'LLC Formation available across all 50 states, Washington, D.C. & Puerto Rico.'
export const VIRTUAL_OFFICE_AVAILABILITY_LABEL = 'Virtual Office available in 21 supported states.'
