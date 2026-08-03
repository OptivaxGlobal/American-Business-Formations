import { Link } from 'react-router-dom'

// Thin wrapper over the existing .btn design system (styles.css) so every
// button in the app shares one implementation instead of hand-typed class
// strings. Renders a <Link> when `to` is given, an <a> when `href` is given,
// otherwise a native <button type="button"> (never a bare, type-less button).
export default function Button({
  as,
  to,
  href,
  variant = 'primary',
  size,
  block = false,
  icon = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'btn',
    variant && `btn-${variant}`,
    size && `btn-${size}`,
    block && 'btn-block',
    icon && 'btn-icon',
    className
  ].filter(Boolean).join(' ')

  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href || as === 'a') return <a href={href} className={cls} {...rest}>{children}</a>
  return <button type={rest.type || 'button'} className={cls} {...rest}>{children}</button>
}
