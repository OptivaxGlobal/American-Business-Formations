import { CheckCircle2 } from 'lucide-react'
import { stateList } from '../data/states'

// Compact, responsive "Available in 21 States" grid reused wherever the
// full state list needs to appear (LLC Formation, Virtual Office, Mail
// Forwarding, Home) rather than repeating the full 21-name list as prose
// in more than one place. `stateList` (src/data/states.js) is the single
// source of truth every state named here is real and currently supported.
export default function SupportedStatesList({ compact = false }) {
  return (
    <ul className={`state-availability-grid${compact ? ' compact' : ''}`}>
      {stateList.map(s => (
        <li key={s.code}><CheckCircle2 aria-hidden="true"/>{s.name}</li>
      ))}
    </ul>
  )
}
