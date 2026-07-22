import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { serviceGroups, services } from '../data/services'

export default function ServiceGrid({ limit }) {
  const all = serviceGroups.flatMap(group => group.items)
  const items = typeof limit === 'number' ? all.slice(0, limit) : all
  return (
    <div className="service-grid">
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
