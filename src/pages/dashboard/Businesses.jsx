import { Building2, ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../../context/BusinessContext'
import Reveal from '../../components/Reveal'

export default function Businesses(){
  const {businesses,selectedBusinessId,setSelectedBusinessId}=useBusiness()
  return <div className="dash-card">
    <div className="dash-card-head"><div><span>All businesses</span><h3>Manage your companies</h3></div><Link to="/start" className="btn btn-primary"><Plus size={16}/> Start a new business</Link></div>
    {businesses.length===0 && <p className="dash-empty">You haven&rsquo;t started a business yet. <Link to="/start">Start your first business</Link>.</p>}
    <div className="business-list">
      {businesses.map((b,i)=><Reveal as="div" delay={i%6} key={b.id} className={`business-list-item ${b.id===selectedBusinessId?'active':''}`}>
        <div className="doc-icon"><Building2/></div>
        <span><strong>{b.name}</strong><small>{b.entityType} • {b.state} • {b.status}</small></span>
        <button className="btn btn-outline" onClick={()=>setSelectedBusinessId(b.id)}>Set active</button>
        <Link to={`/dashboard/businesses/${b.id}`} className="btn btn-primary">Manage <ChevronRight size={16}/></Link>
      </Reveal>)}
    </div>
  </div>
}
