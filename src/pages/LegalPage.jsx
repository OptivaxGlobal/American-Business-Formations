import { useLocation } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import SEO from '../components/SEO'
import { legalPages } from '../data/legal'
import { SUPPORT_EMAIL } from '../data/seo'

export default function LegalPage(){
  const location = useLocation()
  const page = legalPages[location.pathname] || legalPages['/disclaimer']

  return <>
    <SEO title={page.title} description={page.intro} path={location.pathname} />
    <PageHero
      crumbs={<Breadcrumbs items={[{ label: 'Legal', to: '/privacy' }, { label: page.title }]} />}
      eyebrow="Legal information"
      title={page.title}
      description={`Last updated: ${page.updated}`}
    />
    <article className="article-body container article-container">
      <p className="lead">{page.intro}</p>
      {page.sections.map(([heading, body]) => <div key={heading}><h2>{heading}</h2><p>{body}</p></div>)}
      <h2>Contact</h2>
      <p>Questions about this page can be directed to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    </article>
  </>
}
