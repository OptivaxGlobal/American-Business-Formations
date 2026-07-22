import { Link } from 'react-router-dom'

export default function Logo({ light = false }) {
  return (
    <Link className={`brand ${light ? 'brand-light' : ''}`} to="/" aria-label="American Business Formations home">
      <img className="brand-mark" src="/logo.webp" alt="American Business Formations logo" />
    </Link>
  )
}
