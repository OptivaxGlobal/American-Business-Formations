// Document Requirements Engine (Part 7). Turns the centralized per-state
// config (src/config/stateRequirements.js) + the customer's own answers so
// far into the concrete list of document items to show on the Documents &
// Verification step never a static, one-size-fits-all list.
import { getStateRequirements } from '../config/stateRequirements'

// documentType keys line up with server/app/models/support.py's
// DOCUMENT_TYPES (extended to include these) so an uploaded file can be
// matched back to the requirement it satisfies.
const DOC_TYPE_BY_ID = {
  'formation-document': 'certificate_of_formation',
  'ein-confirmation': 'ein_confirmation',
  'operating-agreement-template': 'operating_agreement',
  'professional-license': 'professional_license',
  'registered-agent-consent-note': 'registered_agent_agreement',
}

export function computeDocumentRequirements(form) {
  const req = getStateRequirements(form.state)
  if (!req) {
    return { generated: [], required: [], conditional: [], formationDocumentName: null, stateName: null }
  }

  const generated = (req.generatedDocuments || [])
    .filter(d => !d.condition || d.condition(form))
    .map(d => ({ ...d, requirementType: 'generated', documentType: DOC_TYPE_BY_ID[d.id] || 'other' }))

  const required = (req.requiredCustomerUploads || [])
    .filter(d => !d.condition || d.condition(form))
    .map(d => ({ ...d, requirementType: 'required', documentType: DOC_TYPE_BY_ID[d.id] || 'customer_upload' }))

  const conditional = (req.conditionalCustomerUploads || [])
    .filter(d => !d.condition || d.condition(form))
    .map(d => ({ ...d, requirementType: d.requirementType || 'conditional', documentType: DOC_TYPE_BY_ID[d.id] || 'customer_upload' }))

  return { generated, required, conditional, formationDocumentName: req.formationDocumentName, stateName: null }
}

// Some "conditional" items (e.g. the registered-agent-consent note) are
// purely informational satisfied earlier in the wizard, not an actual
// upload slot and shouldn't count toward the "X of Y required items
// uploaded" progress summary or need a dropzone rendered for them.
export function isUploadCard(item) {
  return item.id !== 'registered-agent-consent-note'
}
