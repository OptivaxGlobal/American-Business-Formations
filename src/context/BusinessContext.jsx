import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const BusinessContext = createContext(null)

const DEFAULT_TIMELINE = [
  { label: 'Draft started', done: true },
  { label: 'Payment received', done: false },
  { label: 'Information under review', done: false },
  { label: 'Ready to file', done: false },
  { label: 'Submitted to state', done: false },
  { label: 'Approved', done: false }
]

function migrateLegacyOnboarding() {
  try {
    const legacy = JSON.parse(localStorage.getItem('abf-onboarding'))
    if (!legacy || !legacy.businessName) return []
    return [{
      id: 'biz-1',
      name: legacy.businessName,
      entityType: legacy.entityType || 'LLC',
      state: legacy.state || '',
      industry: legacy.industry || '',
      description: legacy.description || '',
      owners: legacy.owners || '1',
      management: legacy.management || 'Member-managed',
      services: legacy.services || [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      timeline: DEFAULT_TIMELINE.map(t => ({ ...t })),
      documents: [],
      complianceTasks: []
    }]
  } catch {
    return []
  }
}

function loadBusinesses() {
  try {
    const stored = JSON.parse(localStorage.getItem('abf-businesses'))
    if (stored && Array.isArray(stored)) return stored
  } catch { /* fall through to migration */ }
  return migrateLegacyOnboarding()
}

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState(loadBusinesses)
  const [selectedBusinessId, setSelectedBusinessId] = useState(() => {
    return localStorage.getItem('abf-selected-business') || (loadBusinesses()[0]?.id ?? null)
  })

  useEffect(() => {
    localStorage.setItem('abf-businesses', JSON.stringify(businesses))
  }, [businesses])

  useEffect(() => {
    if (selectedBusinessId) localStorage.setItem('abf-selected-business', selectedBusinessId)
  }, [selectedBusinessId])

  const addBusiness = (data) => {
    const business = {
      id: `biz-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      timeline: DEFAULT_TIMELINE.map(t => ({ ...t })),
      documents: [],
      complianceTasks: [],
      services: [],
      ...data
    }
    setBusinesses(prev => [...prev, business])
    setSelectedBusinessId(business.id)
    return business
  }

  const updateBusiness = (id, patch) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...(typeof patch === 'function' ? patch(b) : patch) } : b))
  }

  const addDocument = (businessId, doc) => {
    updateBusiness(businessId, b => ({
      documents: [...b.documents, { id: `doc-${Date.now()}`, uploadedAt: new Date().toISOString(), ...doc }]
    }))
  }

  const addComplianceTask = (businessId, task) => {
    updateBusiness(businessId, b => ({
      complianceTasks: [...b.complianceTasks, { id: `task-${Date.now()}`, done: false, ...task }]
    }))
  }

  const toggleComplianceTask = (businessId, taskId) => {
    updateBusiness(businessId, b => ({
      complianceTasks: b.complianceTasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
    }))
  }

  const selectedBusiness = useMemo(
    () => businesses.find(b => b.id === selectedBusinessId) || businesses[0] || null,
    [businesses, selectedBusinessId]
  )

  const value = useMemo(() => ({
    businesses,
    selectedBusinessId: selectedBusiness?.id ?? null,
    selectedBusiness,
    setSelectedBusinessId,
    addBusiness,
    updateBusiness,
    addDocument,
    addComplianceTask,
    toggleComplianceTask
  }), [businesses, selectedBusiness])

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export const useBusiness = () => useContext(BusinessContext)
