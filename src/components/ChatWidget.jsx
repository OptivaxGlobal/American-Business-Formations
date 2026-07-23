import { useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'

const replies = [
  'I can help you choose a formation service, understand the onboarding flow, or find the right page.',
  'For a new LLC, start with your state and preferred business name. The guided questionnaire will handle the rest.',
  'Pricing shown on the site excludes state filing fees. Those vary by state.',
  'You can also send a message through the Contact page for a team response.'
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! I’m the ABF Business Guide. What would you like help with?' }])

  const send = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const value = text.trim()
    setMessages(current => [...current, { from: 'user', text: value }, { from: 'bot', text: replies[Math.floor(Math.random() * replies.length)] }])
    setText('')
  }

  return <div className="chat-widget">
    {open && <div className="chat-panel">
      <div className="chat-head"><div><Bot/><span><strong>ABF Business Guide</strong><small>Online</small></span></div><button onClick={() => setOpen(false)} aria-label="Close chat"><X/></button></div>
      <div className="chat-body">{messages.map((message, i) => <div key={i} className={`chat-message ${message.from}`}>{message.text}</div>)}</div>
      <form onSubmit={send}><input value={text} onChange={e => setText(e.target.value)} placeholder="Type your question..."/><button><Send size={18}/></button></form>
    </div>}
    <button className="chat-toggle" onClick={() => setOpen(!open)} aria-label="Open help chat"><MessageCircle/></button>
  </div>
}
