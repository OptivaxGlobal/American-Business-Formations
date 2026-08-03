// Wraps the existing .radio-cards pattern (a group of selectable button
// "cards"), currently hand-rolled 5 separate times inside Onboarding.jsx.
export function RadioCardGroup({ className = '', children }) {
  return <div className={`radio-cards ${className}`.trim()}>{children}</div>
}

export default function RadioCard({ selected, onSelect, title, description, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`${selected ? 'selected' : ''} ${className}`.trim()}
      onClick={onSelect}
      aria-pressed={selected}
      {...rest}
    >
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </button>
  )
}
