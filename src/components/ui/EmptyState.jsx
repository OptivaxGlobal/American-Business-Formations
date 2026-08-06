// Wraps the existing .dash-empty class (styles.css), already used as a plain
// muted <p> across 10 dashboard/admin locations keeps that exact visual
// weight while allowing an optional leading icon and trailing action node.
export default function EmptyState({ icon: Icon, children, action, className = '' }) {
  return (
    <p className={`dash-empty ${className}`.trim()}>
      {Icon && <Icon size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />}
      {children}{action ? <> {action}</> : null}
    </p>
  )
}
