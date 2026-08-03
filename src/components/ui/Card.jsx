// Generic "clean card" surface for marketing pages, matching the same
// visual language already used by the dashboard's .dash-card (white
// background, --line border, brand radius) plus a subtle shadow per the
// site's design direction. See the new .card rule in styles.css.
export default function Card({ as: Tag = 'div', hover = false, compact = false, className = '', children, ...rest }) {
  const cls = ['card', hover && 'card-hover', compact && 'card-compact', className].filter(Boolean).join(' ')
  return <Tag className={cls} {...rest}>{children}</Tag>
}
