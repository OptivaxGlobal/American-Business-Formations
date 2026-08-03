// Wraps the existing (previously unused) .skeleton/.skeleton-text/.skeleton-card
// design tokens in styles.css for any future async-loading surface.
export function SkeletonText({ width, className = '', style, ...rest }) {
  return <div className={`skeleton skeleton-text ${className}`.trim()} style={{ width, ...style }} {...rest} />
}

export function SkeletonCard({ className = '', ...rest }) {
  return <div className={`skeleton skeleton-card ${className}`.trim()} {...rest} />
}

export default function Skeleton({ variant = 'text', ...rest }) {
  return variant === 'card' ? <SkeletonCard {...rest} /> : <SkeletonText {...rest} />
}
