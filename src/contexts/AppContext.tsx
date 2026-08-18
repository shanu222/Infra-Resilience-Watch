import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import type { Advisory, AppSettings, ContentKind, LibraryItem } from '../types'
import { isContentLive, isFutureDate, sortNewest } from '../utils'
import { persistAppState, pickLatestState, readIndexedState, readLocalState, subscribeToRemoteState } from '../data/store'
import { defaultLibrary, EMPTY_SETTINGS, migrateAdvisory } from '../data/migrate'
import {
  bumpCloudView,
  cloudErrorMessage,
  cloudLogin,
  cloudLogout,
  cloudSession,
  deleteAdvisoryRow,
  deleteLibraryRow,
  fetchCloudState,
  isCloudConfigured,
  subscribeCloudAdvisories,
  upsertAdvisoryRow,
  upsertLibraryRow,
  upsertSettingsRow,
} from '../data/cloud'

const LOCAL_ADMIN_USERNAME = 'admin'
const LOCAL_ADMIN_PASSWORD = 'Admin@2026'
const AUTH_KEY = 'infraadvisory_auth'

interface AppState {
  advisories: Advisory[]
  library: LibraryItem[]
  settings: AppSettings
  rev: number
}

interface AppContextType {
  advisories: Advisory[]
  library: LibraryItem[]
  settings: AppSettings
  isAuthenticated: boolean
  ready: boolean
  cloudEnabled: boolean
  cloudError: string | null
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  createAdvisory: (advisory: Omit<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount'>) => Advisory
  updateAdvisory: (id: string, updates: Partial<Advisory>) => void
  saveContent: (
    data: Omit<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount'> & Partial<Pick<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount' | 'status' | 'publishedAt'>>,
    options?: { id?: string; publish?: boolean }
  ) => Promise<Advisory>
  deleteAdvisory: (id: string) => void
  publishAdvisory: (id: string) => Promise<void>
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

function loadState(): AppState {
  try {
    const stored = readLocalState()
    if (stored) {
      const parsed = JSON.parse(stored) as { advisories?: Partial<Advisory>[]; library?: LibraryItem[]; settings?: Partial<AppSettings>; rev?: number }
      return {
        advisories: (parsed.advisories || []).map(migrateAdvisory),
        library: parsed.library?.length ? parsed.library : defaultLibrary(),
        settings: { ...EMPTY_SETTINGS, ...(parsed.settings || {}) },
        rev: parsed.rev || Date.now(),
      }
    }
  } catch {}
  return {
    advisories: [],
    library: defaultLibrary(),
    settings: EMPTY_SETTINGS,
    rev: 0,
  }
}

function applyRemote(parsed: { advisories?: Partial<Advisory>[] | Advisory[]; library?: LibraryItem[]; settings?: Partial<AppSettings>; rev?: number }): AppState {
  return {
    advisories: (parsed.advisories || []).map(a => migrateAdvisory(a)),
    library: parsed.library || [],
    settings: { ...EMPTY_SETTINGS, ...(parsed.settings || {}) },
    rev: parsed.rev || Date.now(),
  }
}

const EMPTY_CLOUD_STATE: AppState = {
  advisories: [],
  library: [],
  settings: EMPTY_SETTINGS,
  rev: 0,
}

function reportCloudError(err: unknown) {
  const message = cloudErrorMessage(err)
  console.error(message, err)
  window.alert(message)
}

export function AppProvider({ children }: { children: ReactNode }) {
  const cloudEnabled = isCloudConfigured()
  const [state, setState] = useState<AppState>(() => (cloudEnabled ? EMPTY_CLOUD_STATE : loadState()))
  const [ready, setReady] = useState(false)
  const [cloudError, setCloudError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(() => !cloudEnabled && localStorage.getItem(AUTH_KEY) === 'true')
  const applyingRemote = useRef(false)

  useEffect(() => {
    let live = true
    void (async () => {
      if (cloudEnabled) {
        const signedIn = await cloudSession()
        if (!live) return
        setIsAuthenticated(signedIn)
        localStorage.setItem(AUTH_KEY, signedIn ? 'true' : 'false')
        if (!signedIn) localStorage.removeItem(AUTH_KEY)
        try {
          const cloud = await fetchCloudState()
          if (live && cloud) {
            applyingRemote.current = true
            setState(applyRemote(cloud))
            setCloudError(null)
          }
        } catch (err) {
          if (live) setCloudError(cloudErrorMessage(err))
        }
        if (live) setReady(true)
        return
      }

      const latest = pickLatestState(readLocalState(), await readIndexedState())
      if (live && latest) {
        setState(s => {
          if ((latest.rev || 0) < (s.rev || 0)) return s
          if ((latest.rev || 0) === (s.rev || 0) && latest.advisories.length < s.advisories.length) return s
          applyingRemote.current = true
          return applyRemote(latest)
        })
      }
      if (live) setReady(true)
    })()

    const unsubLocal = cloudEnabled
      ? () => {}
      : subscribeToRemoteState(remote => {
          setState(s => {
            if ((remote.rev || 0) < (s.rev || 0)) return s
            applyingRemote.current = true
            return applyRemote(remote)
          })
        })
    const unsubCloud = cloudEnabled
      ? subscribeCloudAdvisories(() => {
          void fetchCloudState()
            .then(cloud => {
              if (!cloud) return
              applyingRemote.current = true
              setState(applyRemote(cloud))
              setCloudError(null)
            })
            .catch(err => setCloudError(cloudErrorMessage(err)))
        })
      : () => {}

    return () => {
      live = false
      unsubLocal()
      unsubCloud()
    }
  }, [cloudEnabled])

  useEffect(() => {
    if (!ready || cloudEnabled) return
    if (applyingRemote.current) {
      applyingRemote.current = false
      return
    }
    void persistAppState(state)
  }, [state, ready, cloudEnabled])

  async function login(username: string, password: string) {
    if (cloudEnabled) {
      const email = username.includes('@') ? username : import.meta.env.VITE_ADMIN_EMAIL
      if (!email) return { ok: false, error: 'Sign in with the admin email you created in Supabase Authentication → Users.' }
      const result = await cloudLogin(email, password)
      if (!result.ok) return { ok: false, error: result.error }
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_KEY, 'true')
      try {
        const cloud = await fetchCloudState()
        if (cloud) {
          applyingRemote.current = true
          setState(applyRemote(cloud))
          setCloudError(null)
        }
      } catch (err) {
        setCloudError(cloudErrorMessage(err))
      }
      return { ok: true }
    }
    if (username === LOCAL_ADMIN_USERNAME && password === LOCAL_ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_KEY, 'true')
      return { ok: true }
    }
    return { ok: false, error: 'Invalid credentials. Please try again.' }
  }

  function logout() {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_KEY)
    void cloudLogout()
    if (cloudEnabled) {
      void fetchCloudState().then(cloud => {
        if (cloud) {
          applyingRemote.current = true
          setState(applyRemote(cloud))
        }
      })
    }
  }

  async function saveContent(
    data: Omit<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount'> & Partial<Pick<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount' | 'status' | 'publishedAt'>>,
    options: { id?: string; publish?: boolean } = {}
  ): Promise<Advisory> {
    const now = new Date().toISOString()
    const publish = Boolean(options.publish)
    let result: Advisory | undefined

    setState(s => {
      let next: AppState
      if (!options.id) {
        result = migrateAdvisory({
          ...data,
          id: `adv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: now,
          updatedAt: now,
          version: 1,
          viewCount: 0,
          status: publish ? 'Published' : (data.status || 'Draft'),
          publishedAt: publish ? now : (data.publishedAt ?? null),
          publishDate: publish && isFutureDate(data.publishDate) ? null : (data.publishDate ?? null),
        })
        next = { ...s, rev: Date.now(), advisories: [result, ...s.advisories] }
      } else {
        next = {
          ...s,
          rev: Date.now(),
          advisories: s.advisories.map(a => {
            if (a.id !== options.id) return a
            result = migrateAdvisory({
              ...a,
              ...data,
              id: a.id,
              createdAt: a.createdAt,
              updatedAt: now,
              version: a.version + 1,
              viewCount: a.viewCount,
              status: publish ? 'Published' : (data.status ?? a.status),
              publishedAt: publish ? (a.publishedAt || now) : (data.publishedAt ?? a.publishedAt),
              publishDate: publish && isFutureDate(data.publishDate) ? null : (data.publishDate ?? a.publishDate),
            })
            return result
          }),
        }
      }
      if (!cloudEnabled) void persistAppState(next)
      return next
    })

    if (!result) throw new Error('Item not found')

    if (cloudEnabled) {
      try {
        const prepared = await upsertAdvisoryRow(result)
        result = prepared
        setState(s => ({
          ...s,
          advisories: s.advisories.map(a => a.id === prepared.id ? prepared : a),
        }))
        setCloudError(null)
      } catch (err) {
        const cloud = await fetchCloudState().catch(() => null)
        if (cloud) {
          applyingRemote.current = true
          setState(applyRemote(cloud))
        }
        throw new Error(cloudErrorMessage(err))
      }
    }

    return result
  }

  function createAdvisory(data: Omit<Advisory, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'viewCount'>): Advisory {
    const created = migrateAdvisory({
      ...data,
      id: `adv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      viewCount: 0,
    })
    setState(s => ({ ...s, rev: Date.now(), advisories: [created, ...s.advisories] }))
    if (cloudEnabled) void upsertAdvisoryRow(created).catch(reportCloudError)
    return created
  }

  function updateAdvisory(id: string, updates: Partial<Advisory>) {
    const current = state.advisories.find(a => a.id === id)
    if (!current) return
    void saveContent({ ...current, ...updates }, { id })
  }

  function deleteAdvisory(id: string) {
    setState(s => ({ ...s, rev: Date.now(), advisories: s.advisories.filter(a => a.id !== id) }))
    if (cloudEnabled) void deleteAdvisoryRow(id).catch(reportCloudError)
  }

  async function publishAdvisory(id: string) {
    const current = state.advisories.find(a => a.id === id)
    if (!current) return
    await saveContent(current, { id, publish: true })
  }

  function archiveAdvisory(id: string) {
    const now = new Date().toISOString()
    let nextItem: Advisory | undefined
    setState(s => ({
      ...s,
      rev: Date.now(),
      advisories: s.advisories.map(a => {
        if (a.id !== id) return a
        nextItem = { ...a, status: 'Archived', updatedAt: now }
        return nextItem
      }),
    }))
    if (cloudEnabled && nextItem) void upsertAdvisoryRow(nextItem).catch(reportCloudError)
  }

  function unpublishAdvisory(id: string) {
    const now = new Date().toISOString()
    let nextItem: Advisory | undefined
    setState(s => ({
      ...s,
      rev: Date.now(),
      advisories: s.advisories.map(a => {
        if (a.id !== id) return a
        nextItem = { ...a, status: 'Draft', updatedAt: now }
        return nextItem
      }),
    }))
    if (cloudEnabled && nextItem) void upsertAdvisoryRow(nextItem).catch(reportCloudError)
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
    setState(s => ({ ...s, rev: Date.now(), advisories: [copy, ...s.advisories] }))
    if (cloudEnabled) void upsertAdvisoryRow(copy).catch(reportCloudError)
    return copy
  }

  function incrementViewCount(id: string) {
    setState(s => ({
      ...s,
      rev: Date.now(),
      advisories: s.advisories.map(a =>
        a.id === id ? { ...a, viewCount: a.viewCount + 1 } : a
      ),
    }))
    if (cloudEnabled) void bumpCloudView(id)
  }

  function addLibraryItem(item: Omit<LibraryItem, 'id' | 'createdAt'>) {
    const newItem: LibraryItem = {
      ...item,
      id: `lib_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setState(s => ({ ...s, rev: Date.now(), library: [newItem, ...s.library] }))
    if (cloudEnabled) void upsertLibraryRow(newItem).catch(reportCloudError)
  }

  function deleteLibraryItem(id: string) {
    setState(s => ({ ...s, rev: Date.now(), library: s.library.filter(l => l.id !== id) }))
    if (cloudEnabled) void deleteLibraryRow(id).catch(reportCloudError)
  }

  function getPublishedAdvisories(): Advisory[] {
    return state.advisories.filter(a => isContentLive(a))
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
    setState(s => ({ ...s, rev: Date.now(), advisories: [copy, ...s.advisories] }))
    if (cloudEnabled) void upsertAdvisoryRow(copy).catch(reportCloudError)
    return copy
  }

  function updateSettings(updates: Partial<AppSettings>) {
    setState(s => {
      const settings = { ...s.settings, ...updates }
      if (cloudEnabled) {
        void upsertSettingsRow(settings)
          .then(prepared => {
            setState(cur => ({ ...cur, settings: prepared }))
            setCloudError(null)
          })
          .catch(reportCloudError)
      }
      return { ...s, rev: Date.now(), settings }
    })
  }

  return (
    <AppContext.Provider
      value={{
        advisories: state.advisories,
        library: state.library,
        settings: state.settings,
        isAuthenticated,
        ready,
        cloudEnabled,
        cloudError,
        login,
        logout,
        createAdvisory,
        updateAdvisory,
        saveContent,
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
