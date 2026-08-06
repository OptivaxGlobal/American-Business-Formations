import { Loader2, RefreshCw } from 'lucide-react'

// Shared loading/error wrapper for dashboard/admin panels that load data
// from the real backend reuses the project's existing `.spin` and
// `.alert-banner` classes (styles.css) rather than introducing new visual
// language. Renders children only once loading is done and there's no error.
export default function AsyncState({ loading, error, onRetry, loadingLabel = 'Loading…', children }) {
  if (loading) {
    return (
      <p className="dash-empty" role="status" aria-live="polite">
        <Loader2 className="spin" size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
        {loadingLabel}
      </p>
    )
  }
  if (error) {
    return (
      <div className="alert-banner warning" role="alert">
        <p style={{ margin: 0 }}>{error}</p>
        {onRetry && <button type="button" className="btn btn-outline" onClick={onRetry}>
          <RefreshCw size={15} /> Try again
        </button>}
      </div>
    )
  }
  return children
}
