import { useState } from 'react'

// Generalizes the tab pattern already implemented once in PlatformPreview.jsx
// (role="tablist"/role="tab" over .platform-preview-tabs/.platform-preview-body)
// so a new tabbed panel doesn't need to reinvent that markup. PlatformPreview
// itself is left as-is (working, single existing usage in the homepage hero).
// tabs: array of { id, label, icon?, content }
export default function Tabs({ tabs, defaultTabId, ariaLabel, className = '' }) {
  const [active, setActive] = useState(defaultTabId || tabs[0]?.id)
  const activeTab = tabs.find(t => t.id === active) || tabs[0]

  return (
    <div className={`platform-preview ${className}`.trim()}>
      <div className="platform-preview-tabs" role="tablist" aria-label={ariaLabel}>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active === tab.id}
              className={active === tab.id ? 'active' : ''}
              onClick={() => setActive(tab.id)}
            >
              {Icon && <Icon size={15} />} {tab.label}
            </button>
          )
        })}
      </div>
      <div className="platform-preview-body" role="tabpanel">{activeTab?.content}</div>
    </div>
  )
}
