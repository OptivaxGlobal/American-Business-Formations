import { states, stateFeeSamples } from './states'

// Sample/placeholder fee data for a subset of states, carried over from the
// original onboarding flow. Every other state intentionally has no invented
// fee — real government filing fees must be confirmed with each Secretary
// of State before being shown to customers or relied on by staff.
const SAMPLE_PROCESSING = {
  Delaware: '3-5 business days', Nevada: '1-3 business days', Wyoming: '5-7 business days',
  Texas: '7-10 business days', Florida: '5-8 business days', California: '10-15 business days'
}

export const statesConfig = states.reduce((acc, name) => {
  const hasSample = Object.prototype.hasOwnProperty.call(stateFeeSamples, name)
  acc[name] = {
    name,
    sampleFee: hasSample ? stateFeeSamples[name] : null,
    sampleProcessingTime: SAMPLE_PROCESSING[name] || null,
    verified: false,
    lastVerifiedBy: null,
    lastVerifiedAt: null
  }
  return acc
}, {})

export function getStateConfig(name) {
  return statesConfig[name] || null
}
