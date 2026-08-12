// Single source of truth for the add-on/government-fee numbers that need to
// appear in more than one place (the onboarding checkout AND a service
// page). Values are unchanged from where they previously lived this file
// only consolidates where they're *defined* so the two call sites can never
// drift apart. Plan-tier pricing (Foundation/Accelerated/Complete) still
// lives in src/components/PricingCards.jsx, since llc-formation/formation-kit
// are sold as part of a package rather than as a standalone add-on and their
// service pages link to /pricing instead of stating a flat number.
import { getTexasConfig } from '../config/texas'
import { getFilingFeeRange } from './states'

const texas = getTexasConfig()

export const addOnCatalog = [
  { id: 'registered-agent', name: 'Registered agent (1 year)', price: 80, recurring: 'per year' },
  { id: 'business-formation-filing', name: 'Business formation filing service', price: 95, recurring: null },
  { id: 'compliance-filing', name: 'Compliance filing service', price: 95, recurring: null },
  { id: 'ein-domestic', name: 'EIN application (U.S. applicants)', price: 35, recurring: null },
  { id: 'ein-foreign', name: 'EIN application (foreign applicants)', price: 130, recurring: null },
  { id: 'operating-agreement', name: 'Operating agreement', price: 60, recurring: null },
  { id: 'texas-dba', name: 'Assumed name (DBA) filing', price: 85, recurring: null },
  { id: 'compliance', name: 'Compliance reminders', price: 90, recurring: 'per year' },
  { id: 's-corp-election', name: 'S-Corp election (IRS Form 2553)', price: 130, recurring: null },
  { id: 'apostille', name: 'Apostille service', price: 450, recurring: null },
  { id: 'certificate-good-standing', name: 'Certificate of Good Standing / certified copy filing service', price: 70, recurring: null },
  // Alternatives, not add-ons meant to be selected together — see
  // src/pages/onboarding/steps/AddOnsStep.jsx, which enforces picking at
  // most one of the two.
  { id: 'mail-forwarding', name: 'Mail forwarding (no lease agreement)', price: 20, recurring: 'per month' },
  { id: 'virtual-office', name: 'Virtual office (includes lease agreement)', price: 29, recurring: 'per month' },
  { id: 'expedited', name: 'Expedited processing', price: texas.expeditedFee, recurring: null }
]

// Add-ons a customer can currently select. Kept as its own function (rather
// than exporting addOnCatalog directly for this purpose) so a future
// temporarily-disabled entry can be filtered out here without touching every
// call site see git history for the pattern this replaced.
export function getActiveAddOns() {
  return addOnCatalog.filter(a => !a.disabled)
}

// Maps a service page slug (src/data/services.js) to its matching standalone
// add-on, where one exists outside a formation package.
const SERVICE_TO_ADDON = {
  'registered-agent': 'registered-agent',
  'business-formation-filings': 'business-formation-filing',
  'compliance-filings': 'compliance-filing',
  ein: 'ein-domestic',
  'operating-agreement': 'operating-agreement',
  'texas-dba': 'texas-dba',
  'texas-compliance': 'compliance',
  's-corp-election': 's-corp-election',
  'apostille-services': 'apostille',
  'certificate-of-good-standing': 'certificate-good-standing',
  'mail-forwarding': 'mail-forwarding',
  'virtual-office': 'virtual-office'
}

// A second priced option shown alongside the primary one on a service page
// (e.g. EIN has a domestic price and a separate foreign-applicant price).
const SERVICE_TO_SECONDARY_ADDON = {
  ein: 'ein-foreign'
}

export function getAddOn(id) {
  return addOnCatalog.find(a => a.id === id) || null
}

// Returns the price/fee facts a service page should display for `slug`, or
// { addOn: null, ... } when the service is bundled into a formation package
// rather than sold standalone (llc-formation, formation-kit) those pages
// should link to /pricing instead of stating a flat number.
//
// `governmentFee`/`governmentFeeRange`: llc-formation and
// business-formation-filings are sold across all 21 supported states (see
// src/data/states.js), so there is no single "the" filing fee to show on a
// generic marketing page anymore — `governmentFeeRange` gives the real
// min/max across every supported state instead of picking one state's
// number to display as if it applied to everyone. The exact fee for the
// state a visitor actually selects is always shown during onboarding and
// checkout, computed the same way (getStateFilingFee).
export function getServicePricing(slug) {
  const addOnId = SERVICE_TO_ADDON[slug]
  const secondaryAddOnId = SERVICE_TO_SECONDARY_ADDON[slug]
  const showsStateFeeRange = slug === 'llc-formation' || slug === 'business-formation-filings'
  return {
    addOn: addOnId ? getAddOn(addOnId) : null,
    secondaryAddOn: secondaryAddOnId ? getAddOn(secondaryAddOnId) : null,
    secondaryAddOnLabel: slug === 'ein' ? 'Foreign applicants' : null,
    governmentFee: (slug === 'ein' || slug === 's-corp-election') ? 0 : null,
    governmentFeeRange: showsStateFeeRange ? getFilingFeeRange() : null,
    governmentFeeNote: slug === 'texas-dba'
      ? "Some counties charge an additional filing fee we'll flag this during intake if it applies to you."
      : slug === 'ein'
        ? 'The IRS issues EINs directly at no cost.'
        : slug === 's-corp-election'
          ? 'The IRS does not charge a fee to file Form 2553.'
          : showsStateFeeRange
            ? 'State filing fees vary by entity type and by the state you form in the exact fee for your selected state is shown during onboarding and at checkout, before you pay anything.'
            : slug === 'apostille-services'
              ? "The underlying document's own government or certification fee is separate from our $450 service fee and is confirmed during intake."
              : slug === 'certificate-of-good-standing'
                ? "The state's own fee for the certificate or certified copy is separate from our $70 filing service fee and varies by state."
                : null,
    filingFeeVerified: true
  }
}
