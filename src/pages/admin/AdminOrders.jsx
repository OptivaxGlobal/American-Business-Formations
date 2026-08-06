import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { Table } from '../../components/ui'
import AsyncState from '../../components/dashboard/AsyncState'

const STATUS_LABELS = {
  draft: 'Draft', pending: 'Processing', awaiting_payment: 'Awaiting payment',
  paid: 'Paid', failed: 'Failed', refunded: 'Refunded', cancelled: 'Cancelled',
}

function RecordPaymentForm({ order, onRecorded }){
  const { notify } = useApp()
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    try {
      const res = await api.adminRecordOfflinePayment(order.id, { reference, note })
      notify(`Order ${order.order_number} marked paid.`)
      onRecorded(res.data)
    } catch (err) {
      setErrors(err.fieldErrors || {})
      notify(err.message || 'We could not record this payment. Please try again.', 'error')
    } finally {
      setSaving(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return <button className="btn btn-outline" onClick={()=>setConfirming(true)}>Record offline payment</button>
  }

  return <div className="admin-plan-editor" style={{ marginTop: 8 }}>
    <label>Payment reference (check #, wire confirmation, etc.)<input value={reference} onChange={e=>setReference(e.target.value)} aria-invalid={errors.reference?'true':'false'}/></label>
    {errors.reference && <p className="field-error">{errors.reference}</p>}
    <label>Note<textarea rows="2" value={note} onChange={e=>setNote(e.target.value)} aria-invalid={errors.note?'true':'false'}/></label>
    {errors.note && <p className="field-error">{errors.note}</p>}
    <div className="admin-toolbar">
      <button className="btn btn-primary" disabled={saving} onClick={submit}>{saving ? 'Recording…' : 'Confirm mark this order paid'}</button>
      <button className="btn btn-ghost" onClick={()=>setConfirming(false)} disabled={saving}>Cancel</button>
    </div>
  </div>
}

export default function AdminOrders(){
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentsEnabled, setPaymentsEnabled] = useState(null)

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([api.adminListOrders(), api.adminGetPaymentStatus()])
      .then(([ordersRes, statusRes]) => {
        setOrders(ordersRes.data)
        setPaymentsEnabled(statusRes.data.payments_enabled)
      })
      .catch(err => setError(err?.message || 'We could not load orders. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRecorded = (updatedOrder) => {
    setOrders(list => list.map(o => o.id === updatedOrder.id ? updatedOrder : o))
  }

  return <div className="dash-card">
    <div className="admin-toolbar">
      <h3>Orders & payments</h3>
      <span className={`admin-badge ${paymentsEnabled ? 'approved' : 'pending'}`}>{paymentsEnabled ? 'Online payments enabled' : 'Online payments disabled record offline payments below'}</span>
    </div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading orders…">
      <Table>
        <thead><tr><th>Order</th><th>Service fee</th><th>State fee</th><th>Add-ons</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
        <tbody>
          {orders.length===0 && <tr><td colSpan={8}>No orders yet.</td></tr>}
          {orders.map(o => <tr key={o.id}>
            <td>{o.order_number}</td>
            <td>${(o.service_fee_cents/100).toFixed(2)}</td>
            <td>${(o.state_fee_cents/100).toFixed(2)}</td>
            <td>${(o.add_on_fee_cents/100).toFixed(2)}</td>
            <td><strong>${(o.total_cents/100).toFixed(2)}</strong></td>
            <td><span className={`admin-badge ${o.status==='paid'?'approved':'pending'}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
            <td>{new Date(o.created_at).toLocaleDateString()}</td>
            <td>{o.status === 'awaiting_payment' && <RecordPaymentForm order={o} onRecorded={handleRecorded}/>}</td>
          </tr>)}
        </tbody>
      </Table>
    </AsyncState>
  </div>
}
