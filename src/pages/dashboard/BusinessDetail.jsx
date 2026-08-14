import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CheckCircle2, Download, FileText, Loader2, ShieldCheck, Upload } from 'lucide-react'
import { useBusiness } from '../../context/BusinessContext'
import { api } from '../../lib/api'
import { validateFile } from '../../validations/commonValidation'
import AsyncState from '../../components/dashboard/AsyncState'
import Badge from '../../components/ui/Badge'

// Mirrors DocumentCard.jsx's status vocabulary (Part 23: customers should
// see the same statuses here as during the formation wizard).
const DOC_STATUS_LABEL = {
  not_started: 'Not Started', uploaded: 'Uploaded', received: 'Received',
  under_review: 'Under Review', approved: 'Approved', needs_attention: 'Needs Attention', not_required: 'Not Required',
}
const DOC_STATUS_VARIANT = {
  uploaded: 'success', received: 'success', approved: 'success',
  under_review: 'warning', needs_attention: 'danger', not_started: 'neutral', not_required: 'neutral',
}

const tabs = ['Formation', 'Documents', 'Compliance', 'Services']

const ALLOWED_UPLOAD_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'doc']
const ALLOWED_UPLOAD_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

// The real application-status progression (server/app/models/business.py's
// APPLICATION_STATUSES). info_requested/rejected are branch states shown as
// a distinct highlighted step rather than forced into the linear order.
const STATUS_STEPS = ['draft', 'submitted', 'under_review', 'ready_to_file', 'submitted_to_state', 'approved']
const STATUS_LABELS = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under review', info_requested: 'More information needed',
  ready_to_file: 'Ready to file', submitted_to_state: 'Submitted to state', approved: 'Approved', rejected: 'Rejected',
}

export default function BusinessDetail(){
  const { id } = useParams()
  const { businesses, loading: businessesLoading } = useBusiness()
  const [tab, setTab] = useState('Formation')

  const [documents, setDocuments] = useState([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [docsError, setDocsError] = useState('')
  const [uploadStatus, setUploadStatus] = useState('idle') // idle | uploading | success | error
  const [uploadError, setUploadError] = useState('')

  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState('')

  const business = businesses.find(b => b.id === id)

  const loadDocuments = () => {
    setDocsLoading(true)
    setDocsError('')
    api.listDocuments(id)
      .then(result => setDocuments(result?.data || []))
      .catch(err => setDocsError(err?.message || 'We could not load your documents. Please try again.'))
      .finally(() => setDocsLoading(false))
  }

  const loadTasks = () => {
    setTasksLoading(true)
    setTasksError('')
    api.listComplianceTasks(id)
      .then(result => setTasks(result?.data || []))
      .catch(err => setTasksError(err?.message || 'We could not load your compliance checklist. Please try again.'))
      .finally(() => setTasksLoading(false))
  }

  useEffect(() => {
    if (!id) return
    loadDocuments()
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (businessesLoading) return <p className="dash-empty"><Loader2 className="spin" size={16} style={{ verticalAlign: '-3px', marginRight: 6 }}/> Loading…</p>
  if (!business) return <Navigate to="/dashboard/businesses" replace />

  const handleUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = validateFile(file, { required: true, allowedTypes: ALLOWED_UPLOAD_TYPES, allowedExtensions: ALLOWED_UPLOAD_EXTENSIONS, maxSizeBytes: MAX_UPLOAD_BYTES })
    if (!result.valid) {
      setUploadStatus('error')
      setUploadError(result.message)
      e.target.value = ''
      return
    }
    setUploadStatus('uploading')
    setUploadError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', 'customer_upload')
    try {
      await api.uploadDocument(`/documents/${business.id}/upload`, formData)
      setUploadStatus('success')
      loadDocuments()
    } catch (err) {
      setUploadStatus('error')
      setUploadError(err?.message || 'We could not upload that file. Please try again.')
    } finally {
      e.target.value = ''
    }
  }

  const seedChecklist = async () => {
    try {
      const result = await api.seedComplianceTasks(business.id)
      setTasks(result?.data || [])
    } catch (err) {
      setTasksError(err?.message || 'We could not load the compliance checklist. Please try again.')
    }
  }

  const toggleTask = async (task) => {
    const previous = tasks
    setTasks(t => t.map(x => x.id === task.id ? { ...x, done: !x.done } : x))
    try {
      await api.updateComplianceTask(business.id, task.id, { done: !task.done })
    } catch {
      setTasks(previous) // roll back the optimistic toggle the server rejected it
    }
  }

  const applicationStatus = business.application?.status || business.status || 'draft'
  const stepIndex = STATUS_STEPS.indexOf(applicationStatus)
  const isBranchStatus = stepIndex === -1

  return <div className="dash-card business-detail">
    <div className="dash-card-head"><div><span>{business.entity_type} • {business.state}</span><h3>{business.name}</h3></div></div>
    <div className="business-detail-tabs">{tabs.map(t => <button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div>

    {tab==='Formation' && <div className="timeline">
      {isBranchStatus && <div className={applicationStatus === 'approved' ? 'complete' : ''}><i><ShieldCheck size={16}/></i><span><strong>{STATUS_LABELS[applicationStatus] || applicationStatus}</strong><small>Current status</small></span></div>}
      {!isBranchStatus && STATUS_STEPS.map((step, i) => <div key={step} className={i < stepIndex ? 'complete' : i === stepIndex ? 'current' : ''}>
        <i>{i < stepIndex ? <CheckCircle2/> : i+1}</i>
        <span><strong>{STATUS_LABELS[step]}</strong><small>{i < stepIndex ? 'Complete' : i === stepIndex ? 'Current stage' : 'Upcoming'}</small></span>
      </div>)}
    </div>}

    {tab==='Documents' && <div className="document-list">
      <label className="btn btn-outline document-upload">
        {uploadStatus === 'uploading' ? <Loader2 className="spin" size={16}/> : <Upload size={16}/>}
        {uploadStatus === 'uploading' ? 'Uploading…' : 'Upload a document'}
        <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.docx,.doc" onChange={handleUpload} disabled={uploadStatus === 'uploading'}/>
      </label>
      {uploadStatus === 'success' && <p role="status">Document uploaded.</p>}
      {uploadStatus === 'error' && uploadError && <p className="field-error" role="alert">{uploadError}</p>}
      <AsyncState loading={docsLoading} error={docsError} onRetry={loadDocuments} loadingLabel="Loading your documents…">
        {documents.length===0 && <p className="dash-empty">No documents yet.</p>}
        {documents.map(doc => <div key={doc.id}>
          <div className="doc-icon"><FileText/></div>
          <span><strong>{doc.file_name}</strong><small>{doc.document_type.replace(/_/g, ' ')} • {new Date(doc.created_at).toLocaleDateString()}</small></span>
          {doc.status && <Badge variant={DOC_STATUS_VARIANT[doc.status] || 'neutral'}>{DOC_STATUS_LABEL[doc.status] || doc.status}</Badge>}
          <a className="btn btn-outline" href={api.documentDownloadUrl(business.id, doc.id)} target="_blank" rel="noreferrer" aria-label={`Download ${doc.file_name}`}><Download size={16}/></a>
        </div>)}
      </AsyncState>
    </div>}

    {tab==='Compliance' && <AsyncState loading={tasksLoading} error={tasksError} onRetry={loadTasks} loadingLabel="Loading your compliance checklist…">
      <div className="task-list">
        {tasks.length===0 && <button className="btn btn-outline" onClick={seedChecklist}>Load compliance checklist</button>}
        {tasks.map(task => <label key={task.id} className={task.done?'done':''}>
          <input type="checkbox" checked={task.done} onChange={()=>toggleTask(task)}/>
          <i>{task.done&&<CheckCircle2/>}</i>
          <span><strong>{task.name}</strong><small>{task.due_date || 'No due date set'}</small></span>
        </label>)}
      </div>
    </AsyncState>}

    {tab==='Services' && <div className="tag-row">
      {business.application?.package_name && <span>{business.application.package_name}</span>}
      {(business.application?.add_ons || []).map(s => <span key={s}>{s}</span>)}
      {!business.application?.package_name && !(business.application?.add_ons || []).length && <p className="dash-empty">No services on this business yet. <Link to="/services">Browse services</Link>.</p>}
    </div>}
  </div>
}
