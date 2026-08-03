import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { serviceGroups, services } from '../data/services'

export default function ServiceGrid({ limit, group }) {
  const groups = group ? serviceGroups.filter(g => g.title === group) : serviceGroups
  const all = groups.flatMap(g => g.items)
  const items = typeof limit === 'number' ? all.slice(0, limit) : all
  // Keeps a partial row (e.g. a 4- or 2-item group) from leaving a large
  // empty column on the right instead of rendering a fixed 3-column grid.
  const countClass = [1, 2, 3, 4].includes(items.length) ? ` service-grid--${items.length}` : ''
  return (
    <div className={`service-grid${countClass}`}>
      {items.map(([slug, label], i) => {
        const item = services[slug]
        const Icon = item.icon
        return <Reveal as={Link} className="service-card" key={slug} to={`/${slug}`} delay={i % 6}>
          <div className="service-icon"><Icon /></div>
          <h3>{label}</h3><p>{item.short}</p><span>Explore service <ArrowUpRight size={17}/></span>
        </Reveal>
      })}
    </div>
  )
}
