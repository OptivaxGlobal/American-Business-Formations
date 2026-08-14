import { Navigate, useParams, Link } from 'react-router-dom'
import { Clock, Calendar, ArrowRight } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import BlogContent from '../components/blog/BlogContent'
import BlogCard from '../components/blog/BlogCard'
import { getPostBySlug, getRelatedPosts, formatBlogDate } from '../data/blog'
import { articleSchema, breadcrumbSchema } from '../data/seo'

export default function BlogArticle() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)
  if (!post) return <Navigate to="/404" replace />

  const path = `/blog/${slug}`
  const related = getRelatedPosts(post, 3)

  return <>
    <SEO
      title={post.seoTitle || post.title}
      description={post.seoDescription || post.excerpt}
      path={path}
      type="article"
      follow
      image={post.featuredImage ? `https://americanbusinessformations.com${post.featuredImage}` : undefined}
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [
          articleSchema({
            title: post.title,
            description: post.excerpt,
            path,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            author: post.author,
            authorType: 'Organization',
          }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title }]),
        ].map(({ '@context': _drop, ...rest }) => rest)
      }}
    />

    <section className="article-hero">
      <Reveal as="div" className="container article-container">
        <Breadcrumbs items={[{ label: 'Blog', to: '/blog' }, { label: post.title }]} />
        <span>{post.category}</span>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <p className="article-byline">
          By {post.author}
          <span className="blog-meta-sep">·</span>
          <Calendar size={14} aria-hidden="true" /> {formatBlogDate(post.publishedAt)}
          <span className="blog-meta-sep">·</span>
          <Clock size={14} aria-hidden="true" /> {post.readingTime}
        </p>
      </Reveal>
    </section>

    {post.featuredImage && (
      <div className="container article-container blog-article-image">
        <img src={post.featuredImage} alt="" width={800} height={420} />
      </div>
    )}

    <article className="article-body container article-container">
      <BlogContent blocks={post.content} />

      {post.tags?.length > 0 && (
        <div className="blog-tag-row" aria-label="Article topics">
          {post.tags.map(tag => <span key={tag}>{tag}</span>)}
        </div>
      )}

      {post.relatedService && (
        <div className="article-callout blog-service-cta">
          <div>
            <strong>Ready to take the next step?</strong>
            <p>{post.relatedService.label} takes just a few minutes to get started.</p>
          </div>
          <Link className="btn btn-primary btn-sm" to={post.relatedService.to}>{post.relatedService.label} <ArrowRight size={16} /></Link>
        </div>
      )}
    </article>

    {related.length > 0 && (
      <section className="section soft-section blog-related-section">
        <div className="container">
          <div className="section-heading"><span>Keep Reading</span><h2>Related articles</h2></div>
          <div className="blog-grid">
            {related.map((p, i) => <BlogCard key={p.slug} post={p} delay={i} />)}
          </div>
        </div>
      </section>
    )}
  </>
}
