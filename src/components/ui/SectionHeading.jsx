// Wraps the existing .section-heading markup (styles.css), hand-copied 15+
// times across pages as <div className="section-heading"><span/>eyebrow<h2/>...
export default function SectionHeading({ eyebrow, title, description, centered = false, className = '' }) {
  return (
    <div className={['section-heading', centered && 'centered', className].filter(Boolean).join(' ')}>
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}
