// New primitive no equivalent existed anywhere in the app. CSS-only
// hover/focus tooltip (new .tooltip-* rules in styles.css); `children` should
// be a focusable element (button, link, or a tabIndex={0} wrapper) so the
// tooltip is reachable by keyboard via :focus-within.
export default function Tooltip({ label, children, position = 'top', className = '' }) {
  return (
    <span className={`tooltip-wrap ${className}`.trim()}>
      {children}
      <span className={`tooltip-bubble tooltip-${position}`} role="tooltip">{label}</span>
    </span>
  )
}
