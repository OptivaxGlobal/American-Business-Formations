import { CheckCircle2, ChevronRight, Clock3, FileText, ShieldCheck, Sparkles, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useBusiness } from '../../context/BusinessContext'
import { api } from '../../lib/api'
import Reveal from '../../components/Reveal'
import AsyncState from '../../components/dashboard/AsyncState'
import { getState } from '../../data/states'

const STATUS_STEPS = ['draft', 'submitted', 'under_review', 'ready_to_file', 'submitted_to_state', 'approved']
const STATUS_LABELS = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under review', info_requested: 'More information needed',
  ready_to_file: 'Ready to file', submitted_to_state: 'Submitted to state', approved: 'Approved', rejected: 'Rejected',
}

export default function DashboardHome(){
  const {user}=useApp()
  const {selectedBusiness, loading, error, refetch}=useBusiness()
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (!selectedBusiness) { setDocuments([]); return }
    api.listDocuments(selectedBusiness.id).then(res => setDocuments(res?.data || [])).catch(() => setDocuments([]))
  }, [selectedBusiness])

  const applicationStatus = selectedBusiness?.application?.status || selectedBusiness?.status || 'draft'
  const stepIndex = STATUS_STEPS.indexOf(applicationStatus)
  const pct = stepIndex === -1 ? 100 : Math.round(((stepIndex + 1) / STATUS_STEPS.length) * 100)
  const business = selectedBusiness?.name || 'Your New Business'
  const state = getState(selectedBusiness?.state)?.name || selectedBusiness?.state || 'your state'

  return <AsyncState loading={loading} error={error} onRetry={refetch} loadingLabel="Loading your dashboard…">
    <Reveal as="section" delay={0} className="business-summary">
      <div><span className="status-pill"><Clock3/> {STATUS_LABELS[applicationStatus] || applicationStatus}</span><h2>Good to see you, {user?.name?.split(' ')[0]||'Founder'}.</h2><p>{business} • {selectedBusiness?.entity_type||'LLC'} • {state}</p></div>
      <div className="progress-ring"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16"/><circle className="progress" cx="21" cy="21" r="16" style={{strokeDasharray:`${pct} 100`}}/></svg><strong>{pct}%</strong></div>
      <div className="summary-action"><small>Current stage</small><strong>{STATUS_LABELS[applicationStatus] || applicationStatus}</strong><Link to={selectedBusiness ? `/dashboard/businesses/${selectedBusiness.id}` : '/dashboard/businesses'}>View details <ChevronRight/></Link></div>
    </Reveal>

    <div className="dash-grid">
      <Reveal as="section" delay={1} className="dash-card task-card">
        <div className="dash-card-head"><div><span>Formation status</span><h3>Where things stand</h3></div></div>
        {selectedBusiness ? <div className="timeline">
          {STATUS_STEPS.map((step, i) => <div key={step} className={i < stepIndex ? 'complete' : i === stepIndex ? 'current' : ''}>
            <i>{i < stepIndex ? <CheckCircle2/> : i+1}</i>
            <span><strong>{STATUS_LABELS[step]}</strong><small>{i < stepIndex ? 'Complete' : i === stepIndex ? 'Current stage' : 'Upcoming'}</small></span>
          </div>)}
        </div> : <p className="dash-empty">Start a business to see your formation status here. <Link to="/start">Start a business</Link>.</p>}
      </Reveal>
      <Reveal as="section" delay={2} className="dash-card guide-card"><div className="guide-icon"><Sparkles/></div><span>ABF Guide</span><h3>What should I focus on next?</h3><p>Check your business details, confirm the registered agent selection, and keep an eye on your notifications for updates from our team.</p><div><Link to="/dashboard/guide" className="btn btn-outline btn-block">Ask the ABF Business Guide</Link></div></Reveal>
    </div>

    <div className="dash-grid lower">
      <Reveal as="section" delay={0} className="dash-card" id="documents"><div className="dash-card-head"><div><span>Documents</span><h3>Recent files</h3></div><Link to={selectedBusiness ? `/dashboard/businesses/${selectedBusiness.id}` : '/dashboard/businesses'}>View all</Link></div>
        <div className="document-list">
          {documents.length === 0 && <p className="dash-empty">No documents yet.</p>}
          {documents.slice(0,3).map(doc=><div key={doc.id}><div className="doc-icon"><FileText/></div><span><strong>{doc.file_name}</strong><small>{doc.document_type}</small></span></div>)}
        </div>
      </Reveal>
      <Reveal as="section" delay={1} className="dash-card"><div className="dash-card-head"><div><span>Recommended</span><h3>Complete your business setup</h3></div></div><div className="recommend-list"><Link to="/ein"><div><ShieldCheck/></div><span><strong>Apply for an EIN</strong><small>Prepare for taxes, banking, and hiring.</small></span><ChevronRight/></Link><Link to="/operating-agreement"><div><FileText/></div><span><strong>Operating agreement</strong><small>Put your ownership and rules in writing.</small></span><ChevronRight/></Link><Link to="/texas-compliance"><div><User/></div><span><strong>Compliance support</strong><small>Stay on top of filing and renewal deadlines.</small></span><ChevronRight/></Link></div></Reveal>
    </div>
  </AsyncState>
}
