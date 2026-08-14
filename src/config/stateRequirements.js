// Centralized, state-aware LLC formation requirements the single source
// of truth for everything in this file's shape. Extends (does not
// duplicate) src/data/states.js, which remains the source of truth for
// `name`, `llcFormationFee`, and `filingAuthority` (the figures that
// actually affect a real charge). Nothing here changes a price; this file
// only governs which entity types are offered, which fields are labeled
// "required," which documents are requested, and what post-formation tasks
// are shown all of it read-only display/branching logic on the frontend,
// re-derived from the same facts server-side wherever it matters for
// security (server/app/services/states.py mirrors the parts the backend
// needs to enforce, e.g. entity-type validation).
//
// Every fact below was checked against the cited `officialSources` (a
// state's own Secretary of State / Division of Corporations / Department
// of State never a third-party formation-service blog) as of
// `verifiedDate`. Where a specific detail could not be independently
// confirmed against an official source in this pass, it is listed in
// `needsReview` with a plain-language note instead of being guessed at —
// see docs/state-requirements-audit.md for the consolidated list.
//
// IMPORTANT: `supportedEntityTypes` never removes "LLC" every one of the
// 52 supported states/jurisdictions allows a standard domestic LLC. It only governs
// whether "Series LLC" and "PLLC" are offered/disabled for that state.

export const ENTITY_TYPE_INFO = {
  LLC: {
    label: 'LLC',
    shortLabel: 'Standard LLC',
    description: 'A flexible structure for most small businesses, available across all 50 states, Washington, D.C. & Puerto Rico.',
  },
  'Series LLC': {
    label: 'Series LLC',
    shortLabel: 'Series LLC',
    description: 'One parent LLC that can establish multiple internal "series," each able to hold separate assets and liabilities under a single filing.',
  },
  PLLC: {
    label: 'Professional LLC (PLLC)',
    shortLabel: 'PLLC',
    description: 'For businesses providing a state-licensed professional service (e.g., law, medicine, accounting, engineering). Availability and required licensing documentation depend on your specific profession confirm with your licensing board.',
  },
}

// Applies to a state that offers only the standard LLC used as the base
// for most jurisdictions so each entry below only needs to list what's
// different, not repeat the boilerplate.
function standardOnly() {
  return {
    'Series LLC': { available: false, reason: 'This state’s LLC statute does not currently provide for series LLCs.' },
    PLLC: { available: true, reason: null },
  }
}

const REGISTERED_AGENT_BASELINE = {
  mustHaveStreetAddress: true,
  poBoxAllowed: false,
  consentMethod: 'typed-signature',
  consentFiledWithState: false,
  note: 'Consent is recorded and kept on file by American Business Formations; the state filing itself only requires that a registered agent be named, not a copy of their signed consent.',
}

// ---------------------------------------------------------------------------
// County / City field framing. There is no County input anywhere in the
// wizard (no dropdown, no autocomplete “Do NOT restore a universal
// County dropdown.”). Only New York’s Articles of Organization actually
// asks for the LLC’s county among the 52 supported states/jurisdictions, and that
// answer determines which newspapers satisfy NY’s publication
// requirement; it’s derived server-side from the customer’s own verified
// principal address via the U.S. Census Geocoder once that address is
// complete (see server/app/services/geocoding.py + applications.py),
// never asked for as a field. `countyRequirement` below exists only as
// the documented reasoning for that backend derivation it doesn’t
// drive any UI.
const COUNTY_STATE_REQUIRED = {
  requiredBy: 'state',
  label: 'Required by New York State',
  note: 'New York’s Articles of Organization must state the county of the LLC’s office, and that county determines which newspapers satisfy the Section 206 publication requirement. Derived automatically from the verified business address rather than asked as a form field.',
}
const COUNTY_ABF_OPERATIONAL = {
  requiredBy: 'abf',
  label: 'Not collected',
  note: 'Not a field on this state’s own formation document, and not needed for American Business Formations’ workflow either no county is collected or derived for this state.',
}
const CITY_ABF_OPERATIONAL = {
  requiredBy: 'abf',
  label: 'Requested by American Business Formations',
  note: 'Your city is part of the address already required for your filing; we ask separately to prefill your addresses and match you with local suggestions.',
}

const GENERATED_FORMATION_DOC = (officialName) => ({
  id: 'formation-document',
  label: 'LLC Formation Document',
  officialName,
  generatedBy: 'American Business Formations',
  description: `We prepare your ${officialName} from the answers you provide in this wizard and file it with your state's filing authority on your behalf. You'll review it before it's finalized (see the Review step) there is nothing for you to upload here.`,
})

const EIN_CONFIRMATION_DOC = {
  id: 'ein-confirmation',
  label: 'EIN Confirmation Letter (IRS CP 575 / 147C)',
  generatedBy: 'IRS, relayed to you by American Business Formations',
  description: 'If you selected EIN Assistance, we submit your EIN application to the IRS and deliver the IRS’s confirmation letter to your dashboard once it is issued. Nothing to upload.',
  condition: (form) => Boolean(form.needsEIN),
}

const OPERATING_AGREEMENT_DOC = {
  id: 'operating-agreement-template',
  label: 'Operating Agreement',
  generatedBy: 'American Business Formations',
  description: 'Included with your selected package. We generate a starting Operating Agreement from your ownership/management answers; it is not filed with the state and you’re free to have an attorney review or customize it.',
  condition: (form) => (form.addOns || []).includes('operating-agreement') || form.plan !== 'Foundation',
}

// Registered-agent consent is captured through the checkbox + typed
// signature on the Registered Agent step (Part 15) for every state no
// state in this list requires a scanned/uploaded consent document to be
// filed, so none is requested as a conditional upload by default.
const REGISTERED_AGENT_SELF_OTHER_NOTE = {
  id: 'registered-agent-consent-note',
  label: 'Registered Agent Consent',
  generatedBy: 'You, electronically, on the Registered Agent step',
  description: 'Handled by the typed e-signature and timestamp captured earlier in this wizard no separate document upload is needed for this.',
  condition: (form) => form.registeredAgentType !== 'abf',
}

function professionalLicenseUpload(extra = {}) {
  return {
    id: 'professional-license',
    label: 'Professional license (copy)',
    requirementType: 'conditional',
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSizeMb: 10,
    description: 'Requested only when forming a Professional LLC (PLLC). Not filed with your state’s formation filing itself; used to prepare any professional-licensing-board paperwork bundled with your service and to confirm we’re filing the correct entity type for your profession.',
    condition: (form) => form.entityType === 'PLLC',
    ...extra,
  }
}

// ---------------------------------------------------------------------------
const base = (overrides) => ({
  countyRequirement: COUNTY_ABF_OPERATIONAL,
  cityRequirement: CITY_ABF_OPERATIONAL,
  entityTypeAvailability: standardOnly(),
  registeredAgentRequirements: { ...REGISTERED_AGENT_BASELINE },
  conditionalCustomerUploads: [professionalLicenseUpload(), REGISTERED_AGENT_SELF_OTHER_NOTE],
  requiredCustomerUploads: [],
  needsReview: [],
  ...overrides,
})

export const stateRequirements = {
  AZ: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'az-publication',
        name: 'Newspaper Publication of Formation',
        status: 'conditional',
        responsibility: 'customer',
        governmentFee: 'Varies by newspaper (Arizona Corporation Commission does not set a fixed fee)',
        deadline: 'Within 60 days of formation',
        description: 'Required unless your statutory (registered) agent’s address is in Maricopa or Pima County, where the Corporation Commission’s online public-notice database satisfies the requirement automatically. Otherwise, publish a notice of LLC formation in an approved newspaper in the county of your known place of business for three consecutive publications.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: false, reason: 'Arizona recognizes series LLCs formed in other states when they register to transact business here, but does not currently allow forming a new domestic series LLC, and the inter-series liability shield is not enforceable against Arizona creditors even for a registered foreign series LLC.' },
      PLLC: { available: true, reason: null },
    },
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Arizona PLLC availability was not independently verified for every licensed profession.' }],
    officialSources: [
      { name: 'Arizona Corporation Commission Business Filings', url: 'https://azcc.gov/' },
      { name: 'Arizona Corporation Commission Public Notice (publication exemption)', url: 'https://ecorp.azcc.gov/PublicNotice' },
    ],
    verifiedDate: '2026-08-13',
  }),

  CA: base({
    formationDocumentName: 'Articles of Organization',
    formationDocumentFormNumber: 'Form LLC-1',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'ca-statement-of-information',
        name: 'Statement of Information (Form LLC-12)',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$20',
        deadline: 'Within 90 days of formation, then every 2 years',
        description: 'Filed with the California Secretary of State to confirm your LLC’s address, registered agent, and management on file.',
      },
      {
        id: 'ca-franchise-tax',
        name: '$800 Annual Minimum Franchise Tax',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$800/year minimum (California Franchise Tax Board)',
        deadline: 'Annually; first payment generally due by the 15th day of the 4th month after formation',
        description: 'A minimum franchise tax owed to the California Franchise Tax Board for the privilege of doing business in California, separate from and in addition to the one-time state filing fee.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: false, reason: 'California does not authorize forming a domestic series LLC. A series LLC formed in another state can register as a foreign LLC to transact business in California, but the Franchise Tax Board treats each series as a separate taxpayer subject to its own $800 annual tax.' },
      PLLC: { available: false, reason: 'California Corporations Code § 17701.04(e)/17701.11 excludes licensed professions from the California LLC Act entirely California does not offer a PLLC. Licensed professionals typically form a Registered Limited Liability Partnership (RLLP) or a Professional Corporation instead.' },
    },
    conditionalCustomerUploads: [REGISTERED_AGENT_SELF_OTHER_NOTE],
    officialSources: [
      { name: 'California Secretary of State bizfile Online', url: 'https://bizfileonline.sos.ca.gov/' },
      { name: 'California Franchise Tax Board LLCs', url: 'https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html' },
    ],
    verifiedDate: '2026-08-13',
  }),

  CO: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'co-periodic-report',
        name: 'Periodic Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$25',
        deadline: 'Annually, during the 3-month window starting the month your LLC was formed',
        description: 'Confirms your LLC’s principal address and registered agent are current with the Colorado Secretary of State.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Colorado professional-services LLC availability depends on the specific licensing board (Title 12, C.R.S.); confirm with the customer’s licensing board before filing as a PLLC.' }],
    officialSources: [{ name: 'Colorado Secretary of State', url: 'https://www.coloradosos.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  DE: base({
    formationDocumentName: 'Certificate of Formation',
    generatedDocuments: [GENERATED_FORMATION_DOC('Certificate of Formation'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'de-annual-tax',
        name: 'Annual LLC Franchise Tax',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$300/year flat',
        deadline: 'By June 1 each year',
        description: 'A flat annual tax owed to the Delaware Division of Corporations. Delaware LLCs do not file a separate annual report this flat tax is the entire ongoing state-level requirement.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: true, reason: null },
      PLLC: { available: true, reason: 'Delaware does not use a distinct "PLLC" filing designation licensed professionals generally form a standard Delaware LLC, subject to their licensing board’s own rules. We’ll file it as a standard LLC unless your licensing board requires otherwise.' },
    },
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Confirm whether the customer’s specific profession requires a Delaware Professional Association/Corporation instead of an LLC this varies by licensing board and was not exhaustively checked against all Delaware professional-licensing statutes.' }],
    officialSources: [
      { name: 'Delaware Division of Corporations', url: 'https://corp.delaware.gov/' },
      { name: 'Delaware Division of Corporations How to Form an LLC', url: 'https://corp.delaware.gov/howtoform/' },
      { name: '6 Del. C. § 18-215 (Series of members, managers or LLC interests)', url: 'https://delcode.delaware.gov/title6/c018/index.html' },
    ],
    verifiedDate: '2026-08-13',
  }),

  FL: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'fl-annual-report',
        name: 'Annual Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$138.75',
        deadline: 'January 1 – May 1 each year (late fee applies after May 1)',
        description: 'Filed with the Florida Division of Corporations (Sunbiz) to keep your LLC active and confirm your registered agent and addresses.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: true, reason: 'Florida’s Protected Series LLC law (2025 legislation) took effect July 1, 2026, allowing a Florida LLC to establish protected series with separate assets, liabilities, and liability shields.' },
      PLLC: { available: true, reason: null },
    },
    officialSources: [
      { name: 'Florida Division of Corporations (Sunbiz)', url: 'https://dos.fl.gov/sunbiz/' },
      { name: 'Sunbiz Florida LLC e-filing', url: 'https://dos.fl.gov/sunbiz/start-business/efile/fl-llc/' },
    ],
    verifiedDate: '2026-08-13',
  }),

  GA: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'ga-annual-registration',
        name: 'Annual Registration',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$50 ($60 if filed on paper)',
        deadline: 'April 1 – April 1 each year (annual window)',
        description: 'Filed with the Georgia Secretary of State to keep your LLC in active/compliant status.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Georgia PLLC availability/naming rules were not independently verified against O.C.G.A. Title 14 for every licensed profession.' }],
    officialSources: [{ name: 'Georgia Secretary of State', url: 'https://sos.ga.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  ID: base({
    formationDocumentName: 'Certificate of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Certificate of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'id-annual-report',
        name: 'Annual Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$0 (no fee if filed on time)',
        deadline: 'By the last day of your LLC’s anniversary month each year',
        description: 'Filed with the Idaho Secretary of State free if filed on time, but failing to file can lead to administrative dissolution.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Idaho PLLC availability was not independently verified against Idaho Code Title 30 for every licensed profession.' }],
    officialSources: [{ name: 'Idaho Secretary of State', url: 'https://sos.idaho.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  IL: base({
    formationDocumentName: 'Articles of Organization',
    formationDocumentFormNumber: 'Form LLC-5.5',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'il-annual-report',
        name: 'Annual Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$75',
        deadline: 'Before the first day of your LLC’s anniversary month each year',
        description: 'Filed with the Illinois Secretary of State to keep your LLC in good standing.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: true, reason: null },
      PLLC: { available: true, reason: null },
    },
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Illinois Professional Limited Liability Company Act (805 ILCS 180) availability was confirmed to exist, but per-profession eligibility was not exhaustively checked.' }],
    officialSources: [{ name: 'Illinois Secretary of State', url: 'https://www.ilsos.gov/' }],
    verifiedDate: '2026-08-13',
  }),

  IA: base({
    formationDocumentName: 'Certificate of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Certificate of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'ia-biennial-report',
        name: 'Biennial Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$45 (online) / $60 (paper)',
        deadline: 'Jan 1 – Apr 1 of odd-numbered years',
        description: 'Filed with the Iowa Secretary of State every two years to keep your LLC active.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Iowa PLLC availability was not independently verified against Iowa Code Chapter 489 for every licensed profession.' }],
    officialSources: [{ name: 'Iowa Secretary of State', url: 'https://sos.iowa.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  MT: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'mt-annual-report',
        name: 'Annual Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$20',
        deadline: 'By April 15 each year',
        description: 'Filed with the Montana Secretary of State to keep your LLC in good standing.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: true, reason: null },
      PLLC: { available: true, reason: null },
    },
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Montana PLLC availability was not independently verified against Title 35, Ch. 8, MCA for every licensed profession.' }],
    officialSources: [{ name: 'Montana Secretary of State', url: 'https://sosmt.gov/' }],
    verifiedDate: '2026-08-13',
  }),

  NV: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    requiredCustomerUploads: [],
    postFormationRequirements: [
      {
        id: 'nv-initial-list',
        name: 'Initial List of Managers/Members + Business License',
        status: 'required',
        responsibility: 'american_business_formations',
        governmentFee: '$150 (list) + $200 (state business license), filed together',
        deadline: 'Due with formation, then annually',
        description: 'Filed with the Nevada Secretary of State alongside (or immediately after) your Articles of Organization; American Business Formations prepares and files this from your intake answers as part of your formation service.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: true, reason: null },
      PLLC: { available: true, reason: null },
    },
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Nevada PLLC availability under NRS 89 was not independently verified for every licensed profession.' }],
    officialSources: [{ name: 'Nevada Secretary of State', url: 'https://www.nvsos.gov/' }],
    verifiedDate: '2026-08-13',
  }),

  NH: base({
    formationDocumentName: 'Certificate of Formation',
    generatedDocuments: [GENERATED_FORMATION_DOC('Certificate of Formation'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'nh-annual-report',
        name: 'Annual Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$100',
        deadline: 'By April 1 each year',
        description: 'Filed with the New Hampshire Secretary of State to keep your LLC in good standing.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'New Hampshire PLLC availability was not independently verified against RSA 304-C for every licensed profession.' }],
    officialSources: [{ name: 'New Hampshire Secretary of State', url: 'https://www.sos.nh.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  NJ: base({
    formationDocumentName: 'Certificate of Formation',
    generatedDocuments: [GENERATED_FORMATION_DOC('Certificate of Formation'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'nj-annual-report',
        name: 'Annual Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$75',
        deadline: 'Annually, by the last day of your LLC’s anniversary month',
        description: 'Filed with the New Jersey Division of Revenue and Enterprise Services to keep your LLC active.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'New Jersey PLLC availability was not independently verified against N.J.S.A. 42:2C for every licensed profession.' }],
    officialSources: [{ name: 'New Jersey Division of Revenue and Enterprise Services', url: 'https://www.nj.gov/treasury/revenue/' }],
    verifiedDate: '2026-08-06',
  }),

  NM: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'nm-no-annual-report',
        name: 'No Annual/Biennial Report Required',
        status: 'optional',
        responsibility: 'customer',
        governmentFee: null,
        deadline: null,
        description: 'New Mexico is one of the few states that does not require a recurring annual or biennial report for LLCs informational only, no action needed unless your business details change.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'New Mexico PLLC availability was not independently verified for every licensed profession.' }],
    officialSources: [{ name: 'New Mexico Secretary of State', url: 'https://www.sos.nm.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  NY: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    countyRequirement: COUNTY_STATE_REQUIRED,
    postFormationRequirements: [
      {
        id: 'ny-publication',
        name: 'Newspaper Publication Requirement',
        status: 'required',
        responsibility: 'customer',
        governmentFee: 'Newspaper costs vary by county (often several hundred to well over $1,000 in NYC) + $50 Certificate of Publication filing fee',
        deadline: 'Within 120 days of formation',
        description: 'New York LLC Law § 206 requires publishing a notice of formation once a week for 6 successive weeks in 2 newspapers (one daily, one weekly) designated by the county clerk of the county shown on your Articles of Organization, then filing a Certificate of Publication with affidavits from both papers. Missing the deadline suspends your LLC’s authority to do business until it’s filed.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: false, reason: 'New York’s LLC Law does not currently provide for series LLCs.' },
      PLLC: { available: true, reason: null },
    },
    conditionalCustomerUploads: [
      professionalLicenseUpload({
        description: 'For a New York PLLC, we file a certified copy of your Articles of Organization with the NYS Education Department’s Office of the Professions, along with each licensed member/manager’s New York license number. A copy of your license helps us prepare that filing correctly it is not itself filed with the Department of State.',
      }),
      REGISTERED_AGENT_SELF_OTHER_NOTE,
    ],
    officialSources: [
      { name: 'New York Department of State, Division of Corporations', url: 'https://dos.ny.gov/' },
      { name: 'NY LLC Law § 206 Publication requirement', url: 'https://dos.ny.gov/limited-liability-company' },
      { name: 'NYSED Office of the Professions PLLC filing', url: 'https://www.op.nysed.gov/corporate/domestic-pllc-checklist' },
    ],
    verifiedDate: '2026-08-13',
  }),

  OR: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'or-annual-report',
        name: 'Annual Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$100',
        deadline: 'By your LLC’s anniversary date each year',
        description: 'Filed with the Oregon Secretary of State to keep your LLC active.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Oregon PLLC availability was not independently verified against ORS Chapter 58/63 for every licensed profession.' }],
    officialSources: [{ name: 'Oregon Secretary of State', url: 'https://sos.oregon.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  TX: base({
    formationDocumentName: 'Certificate of Formation',
    formationDocumentFormNumber: 'Form 205',
    generatedDocuments: [GENERATED_FORMATION_DOC('Certificate of Formation'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'tx-public-information-report',
        name: 'Texas Public Information Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$0 (filed with your Franchise Tax Report)',
        deadline: 'Annually, by May 15 (filed alongside your franchise tax report)',
        description: 'Filed with the Texas Comptroller of Public Accounts to confirm your registered agent, registered office, and governing persons on file.',
      },
      {
        id: 'tx-franchise-tax',
        name: 'Texas Franchise Tax',
        status: 'conditional',
        responsibility: 'customer',
        governmentFee: 'Varies; many small LLCs owe $0 but generally still must file a report',
        deadline: 'Annually, by May 15',
        description: 'A privilege tax for doing business in Texas. Confirm your specific obligation with the Comptroller or a tax professional.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: true, reason: null },
      PLLC: { available: true, reason: null },
    },
    officialSources: [
      { name: 'Texas Secretary of State', url: 'https://www.sos.state.tx.us/' },
      { name: 'Form 205 Certificate of Formation instructions', url: 'https://www.sos.state.tx.us/corp/instructions/205.shtml' },
      { name: 'Texas Comptroller Franchise Tax', url: 'https://comptroller.texas.gov/taxes/franchise/' },
    ],
    verifiedDate: '2026-08-13',
  }),

  UT: base({
    formationDocumentName: 'Certificate of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Certificate of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'ut-annual-renewal',
        name: 'Annual Renewal',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$18',
        deadline: 'By your LLC’s anniversary date each year',
        description: 'Filed with the Utah Division of Corporations and Commercial Code to keep your LLC active.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: true, reason: 'Utah’s series LLC provisions (Title 48, Ch. 3a) took effect for filings starting in 2021.' },
      PLLC: { available: true, reason: null },
    },
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Utah PLLC availability was not independently verified for every licensed profession.' }],
    officialSources: [{ name: 'Utah Division of Corporations and Commercial Code', url: 'https://corporations.utah.gov/' }],
    verifiedDate: '2026-08-13',
  }),

  VA: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'va-annual-registration-fee',
        name: 'Annual Registration Fee',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$50',
        deadline: 'By the last day of your LLC’s anniversary month each year',
        description: 'Paid to the Virginia State Corporation Commission to keep your LLC active no separate report form, just the fee.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Virginia PLLC ("professional limited liability company") availability under Va. Code Title 13.1 was not independently verified for every licensed profession in this pass.' }],
    officialSources: [{ name: 'Virginia State Corporation Commission', url: 'https://www.scc.virginia.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  WA: base({
    formationDocumentName: 'Certificate of Formation',
    generatedDocuments: [GENERATED_FORMATION_DOC('Certificate of Formation'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'wa-annual-report',
        name: 'Annual Report',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$70 (online) / $80 (paper)',
        deadline: 'By the end of your LLC’s anniversary month each year',
        description: 'Filed with the Washington Secretary of State/Corporations & Charities Division to keep your LLC active.',
      },
    ],
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Washington PLLC availability under RCW 25.15 was not independently verified for every licensed profession.' }],
    officialSources: [{ name: 'Washington Secretary of State', url: 'https://www.sos.wa.gov/' }],
    verifiedDate: '2026-08-06',
  }),

  WY: base({
    formationDocumentName: 'Articles of Organization',
    generatedDocuments: [GENERATED_FORMATION_DOC('Articles of Organization'), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
    postFormationRequirements: [
      {
        id: 'wy-annual-report',
        name: 'Annual Report (License Tax)',
        status: 'required',
        responsibility: 'customer',
        governmentFee: '$60 minimum (based on in-state assets)',
        deadline: 'By the first day of your LLC’s anniversary month each year',
        description: 'Filed with the Wyoming Secretary of State to keep your LLC active.',
      },
    ],
    entityTypeAvailability: {
      'Series LLC': { available: true, reason: null },
      PLLC: { available: true, reason: null },
    },
    needsReview: [{ field: 'entityTypeAvailability.PLLC', note: 'Wyoming PLLC availability was not independently verified for every licensed profession.' }],
    officialSources: [{ name: 'Wyoming Secretary of State', url: 'https://sos.wyo.gov/' }],
    verifiedDate: '2026-08-13',
  }),

  // --- 2026-08-13 nationwide expansion: 29 more states + DC + PR ---------
  // Same base() defaults as above (typed-signature RA consent, standard
  // generated documents, professional-license conditional upload) unless
  // otherwise noted. PLLC defaults to available-with-needsReview (most
  // states offer some form of it; the exact per-profession rules were not
  // individually verified this session — see
  // docs/nationwide-expansion-audit.md). Series LLC defaults to
  // unavailable except where directly confirmed (South Dakota).
  ...(() => {
    const NEW_STATE_FACTS = {
      AL: ['Certificate of Formation', 'Alabama Secretary of State', 'https://www.sos.alabama.gov/business-entities/llcs', { id: 'al-business-privilege-tax', name: 'Business Privilege Tax / Annual Report', status: 'required', responsibility: 'customer', governmentFee: 'Varies (minimum $50)', deadline: 'Annual, ~3.5 months after formation, then annually', description: 'Filed with the Alabama Department of Revenue to keep your LLC in good standing.' }],
      AK: ['Articles of Organization', 'Alaska Division of Corporations, Business and Professional Licensing', 'https://www.commerce.alaska.gov/web/cbpl/', { id: 'ak-biennial-report', name: 'Biennial Report', status: 'required', responsibility: 'customer', governmentFee: 'Needs Review: confirm current fee', deadline: 'Every 2 years, due Jan 2 of odd-numbered years', description: 'Filed with the Alaska Division of Corporations to keep your LLC active.' }],
      AR: ['Certificate of Organization', 'Arkansas Secretary of State', 'https://www.sos.arkansas.gov/', { id: 'ar-franchise-tax-report', name: 'Annual Franchise Tax Report', status: 'required', responsibility: 'customer', governmentFee: '$150', deadline: 'Annual, due May 1', description: 'Filed with the Arkansas Secretary of State.' }],
      CT: ['Certificate of Organization', 'Connecticut Secretary of the State', 'https://portal.ct.gov/sots', { id: 'ct-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$80', deadline: 'Annual, by anniversary month', description: 'Filed with the Connecticut Secretary of the State.' }],
      HI: ['Articles of Organization', 'Hawaii Department of Commerce and Consumer Affairs, Business Registration Division', 'https://cca.hawaii.gov/breg/', { id: 'hi-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$15', deadline: 'Annual, by end of anniversary quarter', description: 'Filed with Hawaii DCCA Business Registration Division.' }],
      IN: ['Articles of Organization', 'Indiana Secretary of State', 'https://inbiz.in.gov/', { id: 'in-business-entity-report', name: 'Business Entity Report', status: 'required', responsibility: 'customer', governmentFee: '$32 (online)', deadline: 'Every 2 years, by anniversary month', description: 'Filed with the Indiana Secretary of State via INBiz.' }],
      KS: ['Articles of Organization', 'Kansas Secretary of State', 'https://sos.ks.gov/', { id: 'ks-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: 'Needs Review: confirm current fee/requirement', deadline: 'Annual', description: 'Filed with the Kansas Secretary of State confirm current requirement.' }],
      KY: ['Articles of Organization', 'Kentucky Secretary of State', 'https://sos.ky.gov/', { id: 'ky-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$15', deadline: 'Annual, Jan 1 - Jun 30', description: 'Filed with the Kentucky Secretary of State.' }],
      LA: ['Articles of Organization', 'Louisiana Secretary of State', 'https://www.sos.la.gov/', { id: 'la-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$35', deadline: 'Annual, by anniversary date', description: 'Filed with the Louisiana Secretary of State. An Initial Report is also filed together with the Articles of Organization, at no extra charge.' }],
      ME: ['Certificate of Formation', 'Maine Secretary of State, Bureau of Corporations', 'https://www.maine.gov/sos/', { id: 'me-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$85', deadline: 'Annual, due June 1', description: 'Filed with the Maine Secretary of State.' }],
      MD: ['Articles of Organization', 'Maryland Department of Assessments and Taxation', 'https://dat.maryland.gov/', { id: 'md-annual-report', name: 'Annual Report / Personal Property Return', status: 'required', responsibility: 'customer', governmentFee: '$300', deadline: 'Annual, due April 15', description: 'Filed with the Maryland Department of Assessments and Taxation.' }],
      MA: ['Certificate of Organization', 'Massachusetts Secretary of the Commonwealth', 'https://www.sec.state.ma.us/', { id: 'ma-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$500', deadline: 'Annual, by anniversary date', description: 'Filed with the Massachusetts Secretary of the Commonwealth.' }],
      MI: ['Articles of Organization', 'Michigan Department of Licensing and Regulatory Affairs (LARA), Corporations Division', 'https://www.michigan.gov/lara', { id: 'mi-annual-statement', name: 'Annual Statement', status: 'required', responsibility: 'customer', governmentFee: '$25', deadline: 'Annual, due February 15', description: 'Filed with Michigan LARA, Corporations Division.' }],
      MN: ['Articles of Organization', 'Minnesota Secretary of State', 'https://www.sos.state.mn.us/', { id: 'mn-annual-renewal', name: 'Annual Renewal', status: 'required', responsibility: 'customer', governmentFee: 'No fee', deadline: 'Annual', description: 'Filed with the Minnesota Secretary of State to keep your LLC active.' }],
      MS: ['Certificate of Formation', 'Mississippi Secretary of State', 'https://www.sos.ms.gov/', { id: 'ms-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: 'No fee', deadline: 'Annual, by April 15', description: 'Filed with the Mississippi Secretary of State.' }],
      MO: ['Articles of Organization', 'Missouri Secretary of State', 'https://www.sos.mo.gov/', { id: 'mo-no-annual-report', name: 'No Annual Report Required', status: 'optional', responsibility: 'customer', governmentFee: null, deadline: null, description: 'Missouri does not currently require a recurring annual report for LLCs.' }],
      NE: ['Certificate of Organization', 'Nebraska Secretary of State', 'https://sos.nebraska.gov/', { id: 'ne-publication', name: 'Newspaper Publication Requirement', status: 'conditional', responsibility: 'customer', governmentFee: 'Needs Review: confirm current process/cost', deadline: 'Needs Review: confirm current deadline', description: 'Nebraska has a statutory publication requirement similar to New York’s confirm current process before relying on this.' }],
      NC: ['Articles of Organization', 'North Carolina Secretary of State', 'https://www.sosnc.gov/', { id: 'nc-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$200', deadline: 'Annual, due April 15', description: 'Filed with the North Carolina Secretary of State.' }],
      ND: ['Articles of Organization', 'North Dakota Secretary of State', 'https://sos.nd.gov/', { id: 'nd-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$50', deadline: 'Annual, due November 15', description: 'Filed with the North Dakota Secretary of State.' }],
      OH: ['Articles of Organization', 'Ohio Secretary of State', 'https://www.ohiosos.gov/', { id: 'oh-no-annual-report', name: 'No Annual Report or Franchise Tax Required', status: 'optional', responsibility: 'customer', governmentFee: null, deadline: null, description: 'Ohio does not currently require a recurring annual report or franchise tax for LLCs.' }],
      OK: ['Articles of Organization', 'Oklahoma Secretary of State', 'https://www.sos.ok.gov/', { id: 'ok-annual-certificate', name: 'Annual Certificate', status: 'required', responsibility: 'customer', governmentFee: '$25', deadline: 'Annual, by anniversary date', description: 'Filed with the Oklahoma Secretary of State.' }],
      PA: ['Certificate of Organization', 'Pennsylvania Department of State, Bureau of Corporations and Charitable Organizations', 'https://www.pa.gov/agencies/dos.html', { id: 'pa-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$7', deadline: 'Annual, due September 30 (replaced the former decennial report starting 2025)', description: 'Filed with the Pennsylvania Department of State.' }],
      RI: ['Articles of Organization', 'Rhode Island Department of State, Business Services Division', 'https://sos.ri.gov/', { id: 'ri-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$50', deadline: 'Annual, Sep 1 - Nov 1', description: 'Filed with the Rhode Island Department of State.' }],
      SC: ['Articles of Organization', 'South Carolina Secretary of State', 'https://sos.sc.gov/', { id: 'sc-no-annual-report', name: 'No Annual Report Required', status: 'optional', responsibility: 'customer', governmentFee: null, deadline: null, description: 'South Carolina LLCs taxed as partnerships do not currently file a recurring annual report with the Secretary of State.' }],
      SD: ['Articles of Organization', 'South Dakota Secretary of State', 'https://sdsos.gov/', { id: 'sd-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$50', deadline: 'Annual, by first day of anniversary month', description: 'Filed with the South Dakota Secretary of State.' }],
      TN: ['Articles of Organization', 'Tennessee Secretary of State', 'https://sos.tn.gov/', { id: 'tn-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$300 minimum', deadline: 'Annual, by 1st day of 4th month after fiscal year end', description: 'Filed with the Tennessee Secretary of State.' }],
      VT: ['Articles of Organization', 'Vermont Secretary of State', 'https://sos.vermont.gov/', { id: 'vt-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$35', deadline: 'Annual, within 3 months of fiscal year end', description: 'Filed with the Vermont Secretary of State.' }],
      WV: ['Articles of Organization', 'West Virginia Secretary of State', 'https://sos.wv.gov/', { id: 'wv-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$25', deadline: 'Annual, Jan 1 - Jul 1', description: 'Filed with the West Virginia Secretary of State.' }],
      WI: ['Articles of Organization', 'Wisconsin Department of Financial Institutions', 'https://dfi.wi.gov/', { id: 'wi-annual-report', name: 'Annual Report', status: 'required', responsibility: 'customer', governmentFee: '$25', deadline: 'Annual, by end of registration anniversary quarter', description: 'Filed with the Wisconsin Department of Financial Institutions.' }],
      DC: ['Articles of Organization', 'DC Department of Licensing and Consumer Protection (DLCP), Corporations Division', 'https://dlcp.dc.gov/', { id: 'dc-biennial-report', name: 'Biennial Report', status: 'required', responsibility: 'customer', governmentFee: '$300', deadline: 'Every 2 years, due April 1', description: 'Filed with DC DLCP, Corporations Division.' }],
      PR: ['Certificate of Formation (Certificado de Organización)', 'Puerto Rico Department of State', 'https://estado.pr.gov/', { id: 'pr-annual-fee', name: 'Annual Fee', status: 'required', responsibility: 'customer', governmentFee: '$150', deadline: 'Annual, due April 15', description: 'Paid to the Puerto Rico Department of State no separate annual report is required.' }],
    }
    const result = {}
    for (const [code, [docName, authorityName, sourceUrl, postFormation]] of Object.entries(NEW_STATE_FACTS)) {
      result[code] = base({
        formationDocumentName: docName,
        generatedDocuments: [GENERATED_FORMATION_DOC(docName), EIN_CONFIRMATION_DOC, OPERATING_AGREEMENT_DOC],
        postFormationRequirements: [postFormation],
        entityTypeAvailability: code === 'SD'
          ? { 'Series LLC': { available: true, reason: 'South Dakota’s Secretary of State offers a Master Series Article of Organization filing, confirming series LLC availability.' }, PLLC: { available: true, reason: null } }
          : { 'Series LLC': { available: false, reason: 'Not independently confirmed as available for this jurisdiction — defaults to unavailable rather than guessing (see docs/nationwide-expansion-audit.md).' }, PLLC: { available: true, reason: null } },
        needsReview: [
          { field: 'entityTypeAvailability.PLLC', note: `${docName === 'Certificate of Formation (Certificado de Organización)' ? 'Puerto Rico' : ''} PLLC availability for every licensed profession was not independently verified this session.` },
          ...(code !== 'SD' ? [{ field: 'entityTypeAvailability.Series LLC', note: 'Not independently confirmed this session defaults to unavailable rather than guessing.' }] : []),
          ...(postFormation.governmentFee && String(postFormation.governmentFee).startsWith('Needs Review') ? [{ field: 'postFormationRequirements', note: `${postFormation.name}: ${postFormation.governmentFee}` }] : []),
        ],
        officialSources: [{ name: authorityName, url: sourceUrl }],
        verifiedDate: '2026-08-13',
      })
    }
    return result
  })(),
}

export function getStateRequirements(code) {
  return code ? stateRequirements[code.toUpperCase()] || null : null
}

// Every field the wizard collects today is either legally required by all
// jurisdictions (business name, registered agent, addresses, ownership) or
// governed by the per-state overrides above (county/city, entity type).
// This list documents that baseline once rather than repeating it 21 times.
export const UNIVERSAL_REQUIRED_INTAKE_FIELDS = [
  'businessName', 'entityType', 'principalAddress', 'registeredAgent', 'organizer', 'governingPersons',
]
export const UNIVERSAL_OPTIONAL_INTAKE_FIELDS = ['industry', 'launchDate', 'alternateName']

// Returns the resolved entity-type option list for a state: every known
// type, each flagged available/unavailable with a reason used by
// BusinessBasicsStep so unsupported types are shown-but-disabled rather
// than silently missing (Part 3).
export function getEntityTypeOptions(stateCode) {
  const req = getStateRequirements(stateCode)
  const availability = req?.entityTypeAvailability || {}
  return Object.keys(ENTITY_TYPE_INFO).map(id => {
    const info = ENTITY_TYPE_INFO[id]
    const rule = id === 'LLC' ? { available: true, reason: null } : (availability[id] || { available: false, reason: 'Availability for this state has not been confirmed yet.' })
    return { id, ...info, available: rule.available, reason: rule.reason }
  })
}
