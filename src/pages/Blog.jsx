import { useMemo, useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SEO from '../components/SEO'
import BlogCard from '../components/blog/BlogCard'
import { getAllPosts, getFeaturedPosts, BLOG_CATEGORIES } from '../data/blog'
import { breadcrumbSchema, websiteSchema } from '../data/seo'

export default function Blog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const allPosts = getAllPosts()
  const featured = getFeaturedPosts()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allPosts.filter(post => {
      const matchesCategory = !category || post.category === category
      const matchesQuery = !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q) || post.category.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [allPosts, query, category])

  const isFiltering = Boolean(query.trim() || category)

  return <>
    <SEO
      title="Blog Resources & Insights"
      description="Practical, accurate articles on LLC formation, registered agents, business compliance, and running a business from the American Business Formations team."
      path="/blog"
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [websiteSchema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog' }])].map(({ '@context': _drop, ...rest }) => rest)
      }}
    />
    <PageHero
      className="dark"
      eyebrow="Resources & Insights"
      title="Business Formation Insights & Resources"
      description="Practical, accurate articles on forming and running an LLC registered agents, compliance, taxes, and business addresses written by the team that builds this platform."
      actions={<form className="resource-search" role="search" onSubmit={e => e.preventDefault()}>
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="blog-search-input">Search the blog</label>
        <input id="blog-search-input" placeholder="Search articles" value={query} onChange={e => setQuery(e.target.value)} />
        <button type="submit">Search</button>
      </form>}
    />

    {!isFiltering && featured.length > 0 && (
      <section className="section blog-featured-section">
        <div className="container">
          <div className="section-heading"><span>Featured Articles</span><h2>Practical insights for new business owners</h2></div>
          <div className="blog-featured-grid">
            {featured.slice(0, 3).map((post, i) => <BlogCard key={post.slug} post={post} featured delay={i} />)}
          </div>
        </div>
      </section>
    )}

    <section className="section soft-section">
      <div className="container">
        <div className="blog-toolbar">
          <div className="section-heading" style={{ marginBottom: 0 }}>
            <span>All Articles</span>
            <h2>{isFiltering ? `${filtered.length} article${filtered.length === 1 ? '' : 's'} found` : 'Browse every article'}</h2>
          </div>
          <div role="group" aria-label="Filter by category" className="blog-category-pills">
            <button type="button" className={!category ? 'active' : ''} aria-pressed={!category} onClick={() => setCategory(null)}>All topics</button>
            {BLOG_CATEGORIES.map(c => <button type="button" key={c} className={category === c ? 'active' : ''} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
        </div>

        {filtered.length === 0
          ? <p className="dash-empty">No articles match your search. <button type="button" className="text-link" onClick={() => { setQuery(''); setCategory(null) }}>Clear filters</button></p>
          : <div className="blog-grid">{filtered.map((post, i) => <BlogCard key={post.slug} post={post} delay={i} />)}</div>}
      </div>
    </section>

    <div className="closing-cta">
      <div className="container closing-cta-inner">
        <div><span>Ready to continue?</span><h2>Turn what you&rsquo;ve read into a formed LLC.</h2></div>
        <Link className="btn btn-gold" to="/formation-details">Start My LLC <ArrowRight size={18} /></Link>
      </div>
    </div>
  </>
}
