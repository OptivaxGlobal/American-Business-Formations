import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { states } from '../data/states'
import { useApp } from '../context/AppContext'

export default function StateSelector({ compact = false, title = 'Choose your LLC state' }) {
  const navigate = useNavigate()
  const { selectedState, setSelectedState, notify } = useApp()

  const submit = (e) => {
    e.preventDefault()
    if (!selectedState) return notify('Please choose a state first.', 'error')
    navigate('/start')
  }

  return (
    <form className={`state-selector ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <label htmlFor={`state-${compact ? 'compact' : 'full'}`}>{title}</label>
      <div className="state-row">
        <select id={`state-${compact ? 'compact' : 'full'}`} value={selectedState} onChange={e => setSelectedState(e.target.value)}>
          <option value="">Select a state</option>
          {states.map(state => <option key={state}>{state}</option>)}
        </select>
        <button className="btn btn-primary" type="submit">Get started <ArrowRight size={18}/></button>
      </div>
      {!compact && <small>Service fees are separate from state filing fees.</small>}
    </form>
  )
}
