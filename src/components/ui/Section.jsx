// Thin structural wrapper over the existing .section/.section-lg/.section-sm
// + .container/.narrow classes (styles.css), applied ad hoc via
// <section className="section"><div className="container">...</div></section>
// throughout the app today. Existing pages are not required to migrate to
// this it's here so new sections don't hand-copy the scaffolding again.
export function Container({ narrow = false, className = '', children, ...rest }) {
  return <div className={['container', narrow && 'narrow', className].filter(Boolean).join(' ')} {...rest}>{children}</div>
}

export default function Section({ as: Tag = 'section', size = 'default', soft = false, narrow = false, className = '', containerClassName = '', children, ...rest }) {
  const sizeClass = size === 'lg' ? 'section-lg' : size === 'sm' ? 'section-sm' : 'section'
  return (
    <Tag className={[sizeClass, soft && 'soft-section', className].filter(Boolean).join(' ')} {...rest}>
      <Container narrow={narrow} className={containerClassName}>{children}</Container>
    </Tag>
  )
}
