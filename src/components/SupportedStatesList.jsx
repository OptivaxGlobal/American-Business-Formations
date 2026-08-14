import { CheckCircle2 } from 'lucide-react'
import { stateList } from '../data/states'

// Compact, responsive "Available in ..." grid reused wherever a
// jurisdiction list needs to appear (LLC Formation, Virtual Office, Home)
// rather than repeating the list as prose in more than one place.
//
// `list` defaults to the full 52-jurisdiction `stateList` (LLC Formation /
// Registered Agent) Virtual Office has its own, deliberately smaller
// 21-state footprint (src/data/states.js's `virtualOfficeStateList`) and
// must always pass that explicitly rather than relying on this default,
// so the two availability sets can never silently drift onto one shared
// list (see Part 8 of the nationwide-expansion spec).
export default function SupportedStatesList({ compact = false, list = stateList }) {
  return (
    <ul className={`state-availability-grid${compact ? ' compact' : ''}`}>
      {list.map(s => (
        <li key={s.code}><CheckCircle2 aria-hidden="true"/>{s.name}</li>
      ))}
    </ul>
  )
}
