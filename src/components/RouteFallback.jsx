import { Loader2 } from 'lucide-react'

// Suspense fallback for lazy-loaded route chunks. Matches `main{min-height:60vh}`
// (styles.css) so swapping in the real page never causes a layout shift.
export default function RouteFallback() {
  return <div className="route-fallback" role="status" aria-live="polite">
    <Loader2 className="spin" aria-hidden="true" />
    <span className="sr-only">Loading page…</span>
  </div>
}
