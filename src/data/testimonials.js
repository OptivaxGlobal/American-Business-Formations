// Testimonials must never be fabricated. Production ships with an empty
// list and an honest empty state real, verified customer reviews should
// be added here (or through /admin/content) only once they exist.
//
// Each seed entry is intentionally marked so nobody mistakes it for a real
// review if it's left in place during development.
export const seedTestimonials = [
  {
    id: 'seed-1',
    name: 'Replace with verified customer name',
    role: 'Replace with verified customer role/company',
    quote: 'Replace with verified customer review do not publish this placeholder.',
    placeholder: true
  }
]

export function loadTestimonials() {
  try {
    const stored = JSON.parse(localStorage.getItem('abf-admin-testimonials'))
    if (Array.isArray(stored)) return stored
  } catch { /* fall through to empty */ }
  // No verified reviews yet ship empty rather than fabricated content.
  return []
}

export function saveTestimonials(list) {
  try { localStorage.setItem('abf-admin-testimonials', JSON.stringify(list)) } catch { /* storage unavailable */ }
}
