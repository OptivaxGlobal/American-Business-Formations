import { useRef, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'

// Click-to-upload + drag & drop file picker. Client-side validation
// (extension/MIME allow-list, max size) is a UX convenience only the
// server independently re-validates extension, file signature (magic
// bytes), and size before anything is stored (server/app/api/documents.py),
// exactly as Part 10 requires ("do not rely only on frontend validation").
const DEFAULT_ACCEPT = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg,.jpeg', 'image/png': '.png' }

export default function FileDropzone({
  onFile, accept = DEFAULT_ACCEPT, maxSizeMb = 10, disabled = false,
  uploading = false, progress = null, error, label = 'Upload a file', id,
}) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState('')
  const acceptAttr = Object.values(accept).join(',')
  const acceptLabel = Object.values(accept).map(ext => ext.replace(/\./g, '').toUpperCase()).join(', ')

  const validate = (file) => {
    if (!file) return 'No file selected.'
    const okType = Object.keys(accept).includes(file.type) || Object.values(accept).some(ext => ext.split(',').some(e => file.name.toLowerCase().endsWith(e)))
    if (!okType) return `Unsupported file type. Accepted formats: ${acceptLabel}.`
    if (file.size > maxSizeMb * 1024 * 1024) return `File is too large. Maximum size is ${maxSizeMb}MB.`
    return ''
  }

  const handleFiles = (files) => {
    const file = files?.[0]
    const err = validate(file)
    setLocalError(err)
    if (!err && file) onFile(file)
  }

  return (
    <div className="file-dropzone-wrap">
      <div
        className={`file-dropzone${dragOver ? ' is-dragover' : ''}${disabled ? ' is-disabled' : ''}${uploading ? ' is-uploading' : ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={id ? `${id}-hint` : undefined}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onKeyDown={e => { if (!disabled && !uploading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click() } }}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          if (!disabled && !uploading) handleFiles(e.dataTransfer.files)
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={acceptAttr}
          disabled={disabled || uploading}
          className="sr-only"
          onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
        />
        {uploading ? (
          <>
            <Loader2 size={22} className="spin" aria-hidden="true" />
            <span>Uploading{typeof progress === 'number' ? ` ${progress}%` : '…'}</span>
            {typeof progress === 'number' && (
              <div className="file-dropzone-progress"><i style={{ width: `${progress}%` }} /></div>
            )}
          </>
        ) : (
          <>
            <UploadCloud size={22} aria-hidden="true" />
            <span><strong>{label}</strong> click or drag a file here</span>
          </>
        )}
      </div>
      <small id={id ? `${id}-hint` : undefined} className="file-dropzone-hint">Accepted formats: {acceptLabel}. Maximum size {maxSizeMb}MB.</small>
      {(localError || error) && <p className="field-error" role="alert">{localError || error}</p>}
    </div>
  )
}
