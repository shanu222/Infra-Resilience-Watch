import type { Advisory, AppSettings, LibraryItem } from '../types'

export const STORAGE_KEY = 'infraadvisory_data'
const CHANNEL_NAME = 'infraadvisory_sync'
const IDB_NAME = 'infra-resilience-watch'
const IDB_STORE = 'kv'
const IDB_KEY = 'state'

export interface PersistedState {
  advisories: Advisory[]
  library: LibraryItem[]
  settings: AppSettings
  rev: number
}

let channel: BroadcastChannel | null | undefined

function getChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel
  try {
    channel = new BroadcastChannel(CHANNEL_NAME)
  } catch {
    channel = null
  }
  return channel
}

function openIdb(): Promise<IDBDatabase | null> {
  return new Promise(resolve => {
    if (typeof indexedDB === 'undefined') {
      resolve(null)
      return
    }
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

async function idbSet(json: string) {
  const db = await openIdb()
  if (!db) return
  await new Promise<void>(resolve => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(json, IDB_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
  db.close()
}

async function idbGet(): Promise<string | null> {
  const db = await openIdb()
  if (!db) return null
  const value = await new Promise<string | null>(resolve => {
    const tx = db.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY)
    req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null)
    req.onerror = () => resolve(null)
  })
  db.close()
  return value
}

function isNewer(next: PersistedState, prev: PersistedState) {
  if ((next.rev || 0) !== (prev.rev || 0)) return (next.rev || 0) > (prev.rev || 0)
  return (next.advisories?.length || 0) >= (prev.advisories?.length || 0)
}

export async function persistAppState(state: PersistedState) {
  const existingRaw = await idbGet()
  if (existingRaw) {
    try {
      const prev = JSON.parse(existingRaw) as PersistedState
      if (!isNewer(state, prev)) return
    } catch {}
  }

  const json = JSON.stringify(state)
  try {
    localStorage.setItem(STORAGE_KEY, json)
  } catch {
    try {
      const slim = {
        ...state,
        advisories: state.advisories.map(a => ({
          ...a,
          images: a.images.map(img => ({ ...img, dataUrl: img.dataUrl.length > 120000 ? '' : img.dataUrl })),
          customBackground: a.customBackground && a.customBackground.length > 120000 ? '' : a.customBackground,
        })),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
    } catch {}
  }
  await idbSet(json)
  try {
    getChannel()?.postMessage(state)
  } catch {}
}

export function readLocalState(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export async function readIndexedState(): Promise<string | null> {
  try {
    return await idbGet()
  } catch {
    return null
  }
}

export function parsePersisted(raw: string | null): PersistedState | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed || !Array.isArray(parsed.advisories)) return null
    return parsed
  } catch {
    return null
  }
}

export function pickLatestState(...raws: Array<string | null>): PersistedState | null {
  const parsed = raws.map(parsePersisted).filter((s): s is PersistedState => Boolean(s))
  if (!parsed.length) return null
  return parsed.reduce((best, item) => (isNewer(item, best) ? item : best))
}

export function subscribeToRemoteState(onRemote: (state: PersistedState) => void): () => void {
  const onMessage = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object' && Array.isArray(event.data.advisories)) {
      onRemote(event.data as PersistedState)
    }
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return
    const parsed = parsePersisted(event.newValue)
    if (parsed) onRemote(parsed)
  }
  const ch = getChannel()
  ch?.addEventListener('message', onMessage)
  window.addEventListener('storage', onStorage)
  return () => {
    ch?.removeEventListener('message', onMessage)
    window.removeEventListener('storage', onStorage)
  }
}
