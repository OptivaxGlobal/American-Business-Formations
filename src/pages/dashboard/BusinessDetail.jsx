import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CheckCircle2, FileText, ShieldCheck, Upload } from 'lucide-react'
import { useBusiness } from '../../context/BusinessContext'

const tabs = ['Formation', 'Documents', 'Compliance', 'Services']

export default function BusinessDetail(){
  const { id } = useParams()
  const { businesses, addDocument, toggleComplianceTask, addComplianceTask } = useBusiness()
  const [tab, setTab] = useState('Formation')
  const business = businesses.find(b => b.id === id)
  if (!business) return <Navigate to="/dashboard/businesses" replace />

  const handleUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    addDocument(business.id, { name: file.name, category: 'Customer upload' })
    e.target.value = ''
  }

  return <div className="dash-card business-detail">
    <div className="dash-card-head"><div><span>{business.entityType} • {business.state}</span><h3>{business.name}</h3></div></div>
    <div className="business-detail-tabs">{tabs.map(t => <button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div>

    {tab==='Formation' && <div className="timeline">{business.timeline.map((t,i)=><div key={i} className={t.done?'complete':''}><i>{t.done?<CheckCircle2/>:i+1}</i><span><strong>{t.label}</strong><small>{t.done?'Complete':'Upcoming'}</small></span></div>)}</div>}

    {tab==='Documents' && <div className="document-list">
      <label className="btn btn-outline document-upload"><Upload size={16}/> Upload a document<input type="file" hidden onChange={handleUpload}/></label>
      {business.documents.length===0 && <p className="dash-empty">No documents yet.</p>}
      {business.documents.map(doc => <div key={doc.id}><div className="doc-icon"><FileText/></div><span><strong>{doc.name}</strong><small>{doc.category} • {new Date(doc.uploadedAt).toLocaleDateString()}</small></span></div>)}
      <p className="onboarding-note"><ShieldCheck size={15}/> This demo stores document names only in your browser. A production build would use private, signed-URL storage.</p>
    </div>}

    {tab==='Compliance' && <div className="task-list">
      {business.complianceTasks.length===0 && <button className="btn btn-outline" onClick={()=>addComplianceTask(business.id,{label:'File annual report',dueDate:'Varies by state'})}>Add a sample compliance task</button>}
      {business.complianceTasks.map(task => <label key={task.id} className={task.done?'done':''}><input type="checkbox" checked={task.done} onChange={()=>toggleComplianceTask(business.id,task.id)}/><i>{task.done&&<CheckCircle2/>}</i><span><strong>{task.label}</strong><small>{task.dueDate||'No due date set'}</small></span></label>)}
    </div>}

    {tab==='Services' && <div className="tag-row">{business.services?.length ? business.services.map(s=><span key={s}>{s}</span>) : <p className="dash-empty">No services on this business yet.</p>}</div>}
  </div>
}
