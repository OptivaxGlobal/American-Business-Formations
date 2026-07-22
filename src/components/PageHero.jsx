import Reveal from './Reveal'

export default function PageHero({ crumbs, eyebrow, title, description, visual, actions, className = '' }) {
  return (
    <section className={`page-hero-shared ${visual ? 'align-left' : ''} ${className}`.trim()}>
      <div className={`container ${visual ? 'hero-grid' : 'narrow'}`}>
        <Reveal as="div">
          {crumbs}
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
          {actions}
        </Reveal>
        {visual && <Reveal as="div" delay={1} className="service-visual">{visual}</Reveal>}
      </div>
    </section>
  )
}
