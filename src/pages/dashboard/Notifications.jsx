import { Bell, CalendarClock } from 'lucide-react'
import { useMemo } from 'react'
import { useBusiness } from '../../context/BusinessContext'

export default function Notifications(){
  const { businesses } = useBusiness()

  const items = useMemo(() => {
    const list = []
    businesses.forEach(b => {
      const nextStep = b.timeline.find(t=>!t.done)
      if (nextStep) list.push({ id: `${b.id}-step`, icon: 'step', text: `${b.name}: next step is "${nextStep.label}"` })
      b.complianceTasks.filter(t=>!t.done).forEach(t => list.push({ id: t.id, icon: 'task', text: `${b.name}: compliance task "${t.label}" is open` }))
    })
    return list
  }, [businesses])

  return <div className="dash-card">
    <div className="dash-card-head"><div><span>Notifications</span><h3>Recent activity</h3></div></div>
    {items.length===0 && <p className="dash-empty">You&rsquo;re all caught up.</p>}
    <div className="document-list">
      {items.map(item => <div key={item.id}><div className="doc-icon">{item.icon==='task' ? <CalendarClock/> : <Bell/>}</div><span><strong>{item.text}</strong></span></div>)}
    </div>
  </div>
}
