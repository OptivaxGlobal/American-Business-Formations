// Wraps the existing .status-badge design-system class (styles.css).
// variant: 'success' | 'warning' | 'danger' | 'neutral' (default: brand blue)
export default function Badge({ variant, children, className = '', ...rest }) {
  return (
    <span className={['status-badge', variant, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  )
}
