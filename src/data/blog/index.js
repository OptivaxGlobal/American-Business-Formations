// Blog content architecture (Part 22): one structured data file per
// article under ./posts/*.js, never one giant component with every
// article hardcoded inline. Adding a new article is exactly one new file
// in ./posts/ this module picks it up automatically via Vite's
// import.meta.glob (the same pattern src/lib/geography.js uses for
// per-state data) with no other file needing an edit, satisfying "Adding
// a new article should automatically update the listing."
//
// Each post module's default export is a plain object with this shape:
//   slug            string, unique, used for the /blog/:slug URL
//   title           string
//   excerpt         string shown on cards and as a meta-description fallback
//   category        string one of BLOG_CATEGORIES below
//   featuredImage   path under /public (existing site illustrations only —
//                   no new external images), e.g. '/illustrations/banking.svg'
//   author          string a real, generic byline (see AUTHOR_NAME below);
//                   never a fabricated named "expert"
//   publishedAt     'YYYY-MM-DD' ISO date string
//   updatedAt       'YYYY-MM-DD' or null
//   readingTime      string, e.g. '6 min read'
//   featured        boolean shown in the Featured Articles rail
//   tags            string[]
//   seoTitle        string
//   seoDescription  string
//   content         array of content blocks, each one of:
//     { type: 'paragraph', text }
//     { type: 'heading', level: 2 | 3, text, id? }
//     { type: 'list', ordered: boolean, items: string[] }
//     { type: 'table', headers: string[], rows: string[][] }
//     { type: 'quote', text }
//     { type: 'note', text }  a callout, styled like .onboarding-note
//   relatedService  { label, to } | null a relevant service CTA for the article

const modules = import.meta.glob('./posts/*.js', { eager: true })

export const BLOG_CATEGORIES = [
  'LLC Formation',
  'Registered Agent',
  'Compliance',
  'Taxes & EIN',
  'Business Address',
]

// Generic, honest byline this content is prepared and maintained by the
// American Business Formations editorial/product team, not attributed to
// an invented named "expert" with fabricated credentials.
export const AUTHOR_NAME = 'American Business Formations Team'

const allPosts = Object.values(modules)
  .map(m => m.default)
  .filter(Boolean)
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))

export function getAllPosts() {
  return allPosts
}

export function getPostBySlug(slug) {
  return allPosts.find(p => p.slug === slug) || null
}

export function getFeaturedPosts() {
  return allPosts.filter(p => p.featured)
}

export function getPostsByCategory(category) {
  if (!category) return allPosts
  return allPosts.filter(p => p.category === category)
}

export function searchPosts(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return allPosts
  return allPosts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  )
}

// Same category first, most recent first, excluding the article itself capped at `limit`.
export function getRelatedPosts(post, limit = 3) {
  if (!post) return []
  const sameCategory = allPosts.filter(p => p.slug !== post.slug && p.category === post.category)
  const rest = allPosts.filter(p => p.slug !== post.slug && p.category !== post.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

export function formatBlogDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
