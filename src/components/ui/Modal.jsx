import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import useFocusTrap from '../../hooks/useFocusTrap'

// Wraps the existing (previously unused) .modal-overlay/.modal-panel design
// tokens in styles.css with real behavior: Escape-to-close, click-outside-
// to-close, a focus trap while open, and focus restoration on close.
export default function Modal({ open, onClose, title, children, className = '' }) {
  const panelRef = useRef(null)
  useFocusTrap(panelRef, open, onClose)

  if (!open) return null

  return createPortal(
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className={`modal-panel ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title} ref={panelRef}>
        {title && (
          <div className="modal-panel-head">
            <h3>{title}</h3>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
