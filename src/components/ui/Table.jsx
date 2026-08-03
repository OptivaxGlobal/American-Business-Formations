// Wraps the existing .admin-table class (styles.css) plus a scroll container,
// replacing the identical `<div style={{overflowX:'auto'}}><table className="admin-table">`
// markup that was previously hand-duplicated across 6 admin pages.
export default function Table({ className = '', children, ...rest }) {
  return (
    <div className="table-scroll">
      <table className={`admin-table ${className}`.trim()} {...rest}>{children}</table>
    </div>
  )
}
