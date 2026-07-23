import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../../context/BusinessContext'

const keywordAnswers = [
  [['ein', 'tax id'], 'An EIN is a federal tax ID for your business. You can request one from the EIN page — a real filing must go through the IRS, and this platform prepares your request for that process rather than issuing it directly.'],
  [['registered agent'], 'A registered agent receives official state and legal notices on behalf of your business. Most states require one at all times.'],
  [['deadline', 'compliance', 'annual report'], 'Compliance deadlines vary by state and entity type. Check the Compliance tab on your business for tasks that are currently open.'],
  [['document', 'upload'], 'You can upload and review documents from the Documents tab on each business in My Businesses.'],
  [['price', 'cost', 'fee'], 'Service fees and state filing fees are always shown separately during checkout and on your Orders page.']
]

function answerFor(question) {
  const q = question.toLowerCase()
  const match = keywordAnswers.find(([keywords]) => keywords.some(k => q.includes(k)))
  return match ? match[1] : 'I can help with formation status, documents, compliance deadlines, and general terminology. For anything specific to your legal or tax situation, please contact support or a licensed professional.'
}

export default function Guide(){
  const { selectedBusiness } = useBusiness()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const nextStep = selectedBusiness?.timeline?.find(t => !t.done)
  const openTasks = selectedBusiness?.complianceTasks?.filter(t => !t.done) || []

  const suggestions = useMemo(() => {
    const list = []
    if (!selectedBusiness) list.push({ text: 'Start your first business', to: '/start' })
    if (nextStep) list.push({ text: `Review your next step: ${nextStep.label}`, to: selectedBusiness ? `/dashboard/businesses/${selectedBusiness.id}` : '/dashboard/businesses' })
    openTasks.forEach(t => list.push({ text: `Complete compliance task: ${t.label}`, to: `/dashboard/businesses/${selectedBusiness.id}` }))
    if (selectedBusiness && selectedBusiness.documents.length === 0) list.push({ text: 'Upload your first document', to: `/dashboard/businesses/${selectedBusiness.id}` })
    if (list.length === 0) list.push({ text: 'You’re all caught up — explore additional services', to: '/services' })
    return list
  }, [selectedBusiness, nextStep, openTasks])

  const ask = e => { e.preventDefault(); if (question.trim()) setAnswer(answerFor(question)) }

  return <div className="dash-grid">
    <div className="dash-card guide-full">
      <div className="dash-card-head"><div><Sparkles size={18}/><span>ABF Business Guide</span></div></div>
      <h3>Hi{selectedBusiness ? `, ${selectedBusiness.name}` : ''} — here&rsquo;s what I&rsquo;d focus on next.</h3>
      <div className="guide-suggestions">{suggestions.map((s,i) => <Link key={i} to={s.to}>{s.text} <ArrowRight size={15}/></Link>)}</div>
      <form className="guide-ask" onSubmit={ask}>
        <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about EINs, registered agents, deadlines, documents..."/>
        <button className="btn btn-primary">Ask</button>
      </form>
      {answer && <p className="guide-answer">{answer}</p>}
      <p className="onboarding-note"><ShieldCheck size={15}/> The ABF Business Guide gives general product and business-formation guidance only. It is not a lawyer or accountant, does not guarantee approvals or outcomes, and cannot see or change other customers&rsquo; information. Contact support or a licensed professional for advice specific to your situation.</p>
    </div>
  </div>
}
