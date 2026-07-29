// Single site-wide announcement bar (shown in the header topbar). Editable
// from /admin/content without a code change. Keep this to one short,
// factual line the header is intentionally limited to a single slim bar.
const defaultAnnouncement = {
  enabled: true,
  message: 'LLC formation currently available in Texas.'
}

export function loadAnnouncement() {
  try {
    const stored = JSON.parse(localStorage.getItem('abf-admin-announcement'))
    if (stored && typeof stored === 'object' && stored.message) return stored
  } catch { /* fall through to default */ }
  return defaultAnnouncement
}

export function saveAnnouncement(next) {
  try { localStorage.setItem('abf-admin-announcement', JSON.stringify(next)) } catch { /* storage unavailable */ }
}
