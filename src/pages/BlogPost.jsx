import { CheckCircle2 } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { posts } from './Resources'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { articleSchema, breadcrumbSchema } from '../data/seo'

export default function BlogPost(){
  const {slug}=useParams(); const post=posts.find(p=>p.slug===slug); if(!post)return <Navigate to="/404" replace/>
  const path = `/resources/${slug}`
  return <>
    <SEO
      title={post.title}
      description={post.excerpt}
      path={path}
      type="article"
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [
          articleSchema({ title: post.title, description: post.excerpt, path }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/resources' }, { name: post.title }])
        ].map(({ '@context': _drop, ...rest }) => rest)
      }}
    />
    <section className="article-hero"><Reveal as="div" className="container article-container"><Breadcrumbs items={[{ label: 'Resources', to: '/resources' }, { label: post.title }]} /><span>{post.category} • {post.read}</span><h1>{post.title}</h1><p>{post.excerpt}</p></Reveal></section><article className="article-body container article-container"><p className="lead">Starting a business becomes easier when information is organized before forms, calls, or filings begin. This sample article demonstrates the long-form content layout included in the project.</p><h2>Begin with the purpose of the task</h2><p>Write down what you are trying to accomplish, where the business will operate, who owns it, and which decisions still need professional guidance. A clear business profile reduces repeated questions and makes later steps easier to review.</p><div className="article-callout"><CheckCircle2/><div><strong>Founder tip</strong><p>Keep legal names, addresses, ownership percentages, and identification details consistent across every application.</p></div></div><h2>Create one source of truth</h2><p>Store your selected business name, state, addresses, contacts, service choices, and supporting documents in a central workspace. The American Business Formations dashboard in this project is designed around that principle.</p><h3>Information worth organizing</h3><ul><li>Preferred legal business name and alternatives</li><li>Formation state and operating locations</li><li>Owner and manager details</li><li>Business activity and industry description</li><li>Registered agent and mailing preferences</li><li>Tax, banking, permit, and insurance tasks</li></ul><h2>Use professional advice when required</h2><p>General educational content cannot account for every legal, tax, licensing, or financial situation. Consult a qualified professional before relying on a structure, election, filing, or compliance decision.</p></article></>
}
