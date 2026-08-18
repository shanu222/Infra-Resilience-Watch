import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Advisory, AppSettings, ContentKind, LibraryItem } from '../types'
import { DEFAULT_LIBRARY_ITEMS } from '../data/templates'
import { sortNewest } from '../utils'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'Admin@2026'
const STORAGE_KEY = 'infraadvisory_data'
const AUTH_KEY = 'infraadvisory_auth'

interface AppState {
  advisories: Advisory[]
  library: LibraryItem[]
  settings: AppSettings
}

interface AppContextType {
  advisories: Advisory[]
  library: LibraryItem[]
  settings: AppSettings
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  createAdvisory: (advisory: Omit<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount'>) => Advisory
  updateAdvisory: (id: string, updates: Partial<Advisory>) => void
  deleteAdvisory: (id: string) => void
  publishAdvisory: (id: string) => void
  archiveAdvisory: (id: string) => void
  unpublishAdvisory: (id: string) => void
  duplicateAdvisory: (id: string) => Advisory
  generateAdvisoryFromIssue: (id: string) => Advisory
  nextAdvisoryNumber: () => string
  incrementViewCount: (id: string) => void
  addLibraryItem: (item: Omit<LibraryItem, 'id' | 'createdAt'>) => void
  deleteLibraryItem: (id: string) => void
  updateSettings: (updates: Partial<AppSettings>) => void
  getPublishedAdvisories: () => Advisory[]
  getPublishedByKind: (kind: ContentKind) => Advisory[]
  getTodaysWatch: () => Advisory[]
}

const AppContext = createContext<AppContextType | null>(null)

function migrateAdvisory(raw: Partial<Advisory> & { id?: string }): Advisory {
  const now = new Date().toISOString()
  return {
    id: raw.id || `adv_${Date.now()}`,
    kind: raw.kind || 'advisory',
    issueType: raw.issueType || '',
    shortSummary: raw.shortSummary || '',
    videoUrl: raw.videoUrl || '',
    featured: Boolean(raw.featured),
    title: raw.title || '',
    type: raw.type || 'Infrastructure Advisory',
    hazard: raw.hazard || 'Other',
    severity: raw.severity || 'Advisory',
    province: raw.province || '',
    district: raw.district || '',
    specificLocation: raw.specificLocation || '',
    infrastructureTypes: raw.infrastructureTypes || [],
    currentSituation: raw.currentSituation || '',
    observedConditions: raw.observedConditions || '',
    affectedInfrastructure: raw.affectedInfrastructure || [],
    weatherCondition: raw.weatherCondition || '',
    rainfallCondition: raw.rainfallCondition || '',
    riverCondition: raw.riverCondition || '',
    groundCondition: raw.groundCondition || '',
    visibility: raw.visibility || '',
    otherCondition: raw.otherCondition || '',
    risks: raw.risks || '',
    immediateActions: raw.immediateActions || [],
    shortTermMeasures: raw.shortTermMeasures || [],
    mediumTermMeasures: raw.mediumTermMeasures || [],
    longTermMeasures: raw.longTermMeasures || [],
    dos: raw.dos || [],
    donts: raw.donts || [],
    engineeringRecommendations: raw.engineeringRecommendations || [],
    publicGuidance: raw.publicGuidance || '',
    contactInfo: raw.contactInfo || '',
    images: raw.images || [],
    references: raw.references || '',
    keyTakeaway: raw.keyTakeaway || '',
    documentTheme: raw.documentTheme || 'blue-engineering',
    backgroundTemplate: raw.backgroundTemplate || 'ndma-blue',
    customBackground: raw.customBackground || '',
    orgLogo: raw.orgLogo || '',
    wingLogo: raw.wingLogo || '',
    advisoryNumber: raw.advisoryNumber || '',
    identifiedProblem: raw.identifiedProblem || '',
    videoTitle: raw.videoTitle || '',
    videoDescription: raw.videoDescription || '',
    videoThumbnail: raw.videoThumbnail || '',
    videoDuration: raw.videoDuration || '',
    status: raw.status || 'Draft',
    version: raw.version || 1,
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
    publishedAt: raw.publishedAt ?? null,
    expiryDate: raw.expiryDate ?? null,
    publishDate: raw.publishDate ?? null,
    viewCount: raw.viewCount || 0,
  }
}

const EMPTY_SETTINGS: AppSettings = {
  orgLogo: '',
  wingLogo: '',
  advisoryLogo: '',
  defaultBackgroundTemplate: 'ndma-blue',
  defaultCustomBackground: '',
  defaultTheme: 'blue-engineering',
}

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as { advisories?: Partial<Advisory>[]; library?: LibraryItem[]; settings?: Partial<AppSettings> }
      return {
        advisories: (parsed.advisories || []).map(migrateAdvisory),
        library: parsed.library?.length
          ? parsed.library
          : DEFAULT_LIBRARY_ITEMS.map((item, i) => ({
              ...item,
              id: `lib_${i}`,
              createdAt: new Date().toISOString(),
            })),
        settings: { ...EMPTY_SETTINGS, ...(parsed.settings || {}) },
      }
    }
  } catch {}
  return {
    advisories: [],
    library: DEFAULT_LIBRARY_ITEMS.map((item, i) => ({
      ...item,
      id: `lib_${i}`,
      createdAt: new Date().toISOString(),
    })),
    settings: EMPTY_SETTINGS,
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function isLive(a: Advisory, now = new Date()): boolean {
  if (a.status !== 'Published') return false
  if (a.publishDate && new Date(a.publishDate) > now) return false
  if (a.expiryDate && new Date(a.expiryDate) < now) return false
  return true
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true'
  })

  useEffect(() => {
    saveState(state)
  }, [state])

  function login(username: string, password: string): boolean {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_KEY, 'true')
      return true
    }
    return false
  }

  function logout() {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_KEY)
  }

  function createAdvisory(data: Omit<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount'>): Advisory {
    const now = new Date().toISOString()
    const advisory = migrateAdvisory({
      ...data,
      id: `adv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      version: 1,
      viewCount: 0,
    })
    setState(s => ({ ...s, advisories: [advisory, ...s.advisories] }))
    return advisory
  }

  function updateAdvisory(id: string, updates: Partial<Advisory>) {
    setState(s => ({
      ...s,
      advisories: s.advisories.map(a =>
        a.id === id
          ? migrateAdvisory({ ...a, ...updates, updatedAt: new Date().toISOString(), version: a.version + 1 })
          : a
      ),
    }))
  }

  function deleteAdvisory(id: string) {
    setState(s => ({ ...s, advisories: s.advisories.filter(a => a.id !== id) }))
  }

  function publishAdvisory(id: string) {
    const now = new Date().toISOString()
    setState(s => ({
      ...s,
      advisories: s.advisories.map(a =>
        a.id === id ? { ...a, status: 'Published', publishedAt: a.publishedAt || now, updatedAt: now } : a
      ),
    }))
  }

  function archiveAdvisory(id: string) {
    setState(s => ({
      ...s,
      advisories: s.advisories.map(a =>
        a.id === id ? { ...a, status: 'Archived', updatedAt: new Date().toISOString() } : a
      ),
    }))
  }

  function unpublishAdvisory(id: string) {
    setState(s => ({
      ...s,
      advisories: s.advisories.map(a =>
        a.id === id ? { ...a, status: 'Draft', updatedAt: new Date().toISOString() } : a
      ),
    }))
  }

  function duplicateAdvisory(id: string): Advisory {
    const original = state.advisories.find(a => a.id === id)
    if (!original) throw new Error('Item not found')
    const now = new Date().toISOString()
    const copy = migrateAdvisory({
      ...original,
      id: `adv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: `Copy of ${original.title}`,
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      featured: false,
      version: 1,
      viewCount: 0,
    })
    setState(s => ({ ...s, advisories: [copy, ...s.advisories] }))
    return copy
  }

  function incrementViewCount(id: string) {
    setState(s => ({
      ...s,
      advisories: s.advisories.map(a =>
        a.id === id ? { ...a, viewCount: a.viewCount + 1 } : a
      ),
    }))
  }

  function addLibraryItem(item: Omit<LibraryItem, 'id' | 'createdAt'>) {
    const newItem: LibraryItem = {
      ...item,
      id: `lib_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setState(s => ({ ...s, library: [newItem, ...s.library] }))
  }

  function deleteLibraryItem(id: string) {
    setState(s => ({ ...s, library: s.library.filter(l => l.id !== id) }))
  }

  function getPublishedAdvisories(): Advisory[] {
    const now = new Date()
    return state.advisories.filter(a => isLive(a, now))
  }

  function getPublishedByKind(kind: ContentKind): Advisory[] {
    return getPublishedAdvisories().filter(a => a.kind === kind)
  }

  function getTodaysWatch(): Advisory[] {
    return sortNewest(getPublishedAdvisories()).slice(0, 12)
  }

  function nextAdvisoryNumber(): string {
    const year = new Date().getFullYear()
    const prefix = `IRW-${year}-`
    const seq = state.advisories
      .map(a => a.advisoryNumber)
      .filter(n => n.startsWith(prefix))
      .map(n => parseInt(n.replace(prefix, ''), 10))
      .filter(n => Number.isFinite(n))
    const next = (seq.length ? Math.max(...seq) : 0) + 1
    return `${prefix}${String(next).padStart(3, '0')}`
  }

  function generateAdvisoryFromIssue(id: string): Advisory {
    const original = state.advisories.find(a => a.id === id)
    if (!original) throw new Error('Item not found')
    const now = new Date().toISOString()
    const copy = migrateAdvisory({
      ...original,
      id: `adv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      kind: 'advisory',
      type: 'Infrastructure Advisory',
      title: original.title,
      advisoryNumber: nextAdvisoryNumber(),
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      featured: false,
      version: 1,
      viewCount: 0,
    })
    setState(s => ({ ...s, advisories: [copy, ...s.advisories] }))
    return copy
  }

  function updateSettings(updates: Partial<AppSettings>) {
    setState(s => ({ ...s, settings: { ...s.settings, ...updates } }))
  }

  return (
    <AppContext.Provider
      value={{
        advisories: state.advisories,
        library: state.library,
        settings: state.settings,
        isAuthenticated,
        login,
        logout,
        createAdvisory,
        updateAdvisory,
        deleteAdvisory,
        publishAdvisory,
        archiveAdvisory,
        unpublishAdvisory,
        duplicateAdvisory,
        generateAdvisoryFromIssue,
        nextAdvisoryNumber,
        incrementViewCount,
        addLibraryItem,
        deleteLibraryItem,
        updateSettings,
        getPublishedAdvisories,
        getPublishedByKind,
        getTodaysWatch,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
