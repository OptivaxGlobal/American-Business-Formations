import { ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import { formatBlogDate } from '../../data/blog'

// One blog post card used for both the featured rail and the main grid
// (the `featured` prop only changes sizing/emphasis via CSS, not markup).
export default function BlogCard({ post, featured = false, delay = 0 }) {
  return (
    <Reveal as={Link} to={`/blog/${post.slug}`} className={`blog-card${featured ? ' blog-card-featured' : ''}`} delay={delay % 6}>
      <div className="blog-card-image">
        <img src={post.featuredImage} alt="" width={480} height={270} loading="lazy" />
      </div>
      <div className="blog-card-body">
        <span className="blog-card-category">{post.category}</span>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="blog-card-meta">
          <span>{formatBlogDate(post.publishedAt)}</span>
          <span><Clock size={13} aria-hidden="true" /> {post.readingTime}</span>
        </div>
        <b className="blog-card-link">Read Full Article <ArrowRight size={15} /></b>
      </div>
    </Reveal>
  )
}
