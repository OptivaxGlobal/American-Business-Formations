import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react'

// Wraps the existing .alert-banner design-system class (styles.css), already
// used ad hoc across ServicePage.jsx/Home.jsx/Reviews.jsx this gives every
// new usage a consistent icon-per-variant default instead of re-picking one.
const DEFAULT_ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: ShieldAlert }

export default function Alert({ variant = 'info', icon, children, className = '', ...rest }) {
  const Icon = icon || DEFAULT_ICONS[variant] || Info
  return (
    <div className={['alert-banner', variant, className].filter(Boolean).join(' ')} {...rest}>
      <Icon size={20} />
      <div>{children}</div>
    </div>
  )
}
