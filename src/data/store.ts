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

export function persistAppState(state: PersistedState) {
  const json = JSON.stringify(state)
  try {
    localStorage.setItem(STORAGE_KEY, json)
  } catch {
    // Quota can fail when images are large; IndexedDB still keeps the live copy.
  }
  void idbSet(json)
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

export function subscribeToRemoteState(onRemote: (state: PersistedState) => void): () => void {
  const channel = getChannel()
  const onMessage = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object' && Array.isArray(event.data.advisories)) {
      onRemote(event.data as PersistedState)
    }
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return
    try {
      const parsed = JSON.parse(event.newValue) as PersistedState
      if (parsed && Array.isArray(parsed.advisories)) onRemote(parsed)
    } catch {}
  }
  channel?.addEventListener('message', onMessage)
  window.addEventListener('storage', onStorage)
  return () => {
    channel?.removeEventListener('message', onMessage)
    window.removeEventListener('storage', onStorage)
  }
}
