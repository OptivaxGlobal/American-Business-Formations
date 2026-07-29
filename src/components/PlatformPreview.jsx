import { useState } from 'react'
import { CheckCircle2, Clock, FileText, MessageSquare, ShieldCheck, Wrench } from 'lucide-react'

const tabs = [
  {
    id: 'formation',
    label: 'Formation',
    icon: ShieldCheck,
    render: () => (
      <div className="preview-timeline">
        {['Information submitted', 'Internal review', 'Ready to file', 'Submitted to state'].map((label, i) => (
          <div key={label} className={`preview-timeline-row ${i < 2 ? 'done' : i === 2 ? 'current' : ''}`}>
            {i < 2 ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
            <span>{label}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    render: () => (
      <div className="preview-doc-list">
        <div><FileText size={16}/><span>Formation questionnaire</span><small>Ready</small></div>
        <div><FileText size={16}/><span>Certificate of Formation</span><small>Pending filing</small></div>
        <div><FileText size={16}/><span>Registered agent agreement</span><small>Signed</small></div>
      </div>
    )
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: ShieldCheck,
    render: () => (
      <div className="preview-doc-list">
        <div><ShieldCheck size={16}/><span>Public Information Report</span><small>Due next year</small></div>
        <div><ShieldCheck size={16}/><span>Franchise tax report</span><small>Due next year</small></div>
        <div><ShieldCheck size={16}/><span>Registered agent renewal</span><small>Tracked</small></div>
      </div>
    )
  },
  {
    id: 'services',
    label: 'Services',
    icon: Wrench,
    render: () => (
      <div className="preview-doc-list">
        <div><Wrench size={16}/><span>Registered agent</span><small>Active</small></div>
        <div><Wrench size={16}/><span>EIN assistance</span><small>Available</small></div>
        <div><Wrench size={16}/><span>Operating agreement</span><small>Available</small></div>
      </div>
    )
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    render: () => (
      <div className="preview-doc-list">
        <div><MessageSquare size={16}/><span>Support team</span><small>1 unread</small></div>
      </div>
    )
  }
]

export default function PlatformPreview() {
  const [active, setActive] = useState('formation')
  const activeTab = tabs.find(t => t.id === active)
  return (
    <div className="platform-preview">
      <div className="platform-preview-tabs" role="tablist" aria-label="Dashboard preview">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} role="tab" aria-selected={active === tab.id} className={active === tab.id ? 'active' : ''} onClick={() => setActive(tab.id)}>
              <Icon size={15}/> {tab.label}
            </button>
          )
        })}
      </div>
      <div className="platform-preview-body" role="tabpanel">{activeTab.render()}</div>
    </div>
  )
}
