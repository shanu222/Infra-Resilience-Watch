import type { Advisory, AppSettings, LibraryItem } from '../types'
import { getSupabase, isCloudConfigured } from '../lib/supabase'
import { EMPTY_SETTINGS, migrateAdvisory } from './migrate'

export { isCloudConfigured }

function normalizeCloudMessage(msg: string) {
  if (/Could not find the table|schema cache|PGRST205|relation .+ does not exist/i.test(msg)) {
    return 'Cloud tables are missing. In Supabase open SQL Editor, paste supabase/schema.sql, click Run, then refresh this page.'
  }
  if (/Bucket not found|media/i.test(msg) && /storage|bucket/i.test(msg)) {
    return 'The media storage bucket is missing. In Supabase Storage create a public bucket named media, or re-run supabase/schema.sql.'
  }
  if (/Invalid API key|JWT|invalid api key/i.test(msg)) {
    return 'Supabase API key is invalid. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel, then redeploy.'
  }
  if (/Email not confirmed|email_not_confirmed/i.test(msg)) {
    return 'Email not confirmed. In Supabase turn off Confirm email (Authentication → Providers → Email) or confirm the user in Authentication → Users.'
  }
  if (/Invalid login credentials|invalid_credentials/i.test(msg)) {
    return 'Invalid email or password. Use the exact email from Supabase Authentication → Users (check spelling) and the password you set there.'
  }
  if (/Failed to fetch|NetworkError|Load failed|Network request failed/i.test(msg)) {
    return 'Cannot reach Supabase. Open your Supabase dashboard and restore the project if it is paused. Then confirm VITE_SUPABASE_URL in Vercel matches Project Settings → API → Project URL, and redeploy.'
  }
  return msg
}

export function cloudErrorMessage(err: unknown): string {
  if (err == null) return 'Cloud database request failed.'

  if (typeof err === 'string') return normalizeCloudMessage(err)

  if (err instanceof Error && err.message) return normalizeCloudMessage(err.message)

  if (typeof err === 'object') {
    const o = err as Record<string, unknown>
    const parts = [o.message, o.error_description, o.msg, o.details, o.hint]
      .filter(v => typeof v === 'string' && v.trim()) as string[]
    if (parts.length) return normalizeCloudMessage(parts.join(' — '))
    if (typeof o.code === 'string' && o.code) return normalizeCloudMessage(o.code)
  }

  const fallback = String(err)
  if (fallback === '[object Object]') return 'Cloud database request failed. Check Supabase setup and run supabase/schema.sql.'
  return normalizeCloudMessage(fallback)
}

export async function pingCloud(): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Cloud database is not configured.' }
  try {
    const { error } = await supabase.from('app_settings').select('id').limit(1)
    if (error) return { ok: false, error: cloudErrorMessage(error) }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: cloudErrorMessage(err) }
  }
}

function dataUrlToBlob(dataUrl: string) {
  const [header, body] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { blob: new Blob([bytes], { type: mime }), mime }
}

function extFor(mime: string) {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  return 'jpg'
}

async function uploadDataUrl(path: string, dataUrl: string) {
  const supabase = getSupabase()
  if (!supabase || !dataUrl.startsWith('data:')) return dataUrl
  const { blob, mime } = dataUrlToBlob(dataUrl)
  const { error } = await supabase.storage.from('media').upload(path, blob, {
    upsert: true,
    contentType: mime,
  })
  if (error) throw error
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

export async function prepareAdvisoryForCloud(item: Advisory): Promise<Advisory> {
  const images = await Promise.all(item.images.map(async (img, i) => {
    if (!img.dataUrl?.startsWith('data:')) return img
    const url = await uploadDataUrl(`advisories/${item.id}/${img.id || i}.${extFor('image/jpeg')}`, img.dataUrl)
    return { ...img, dataUrl: url }
  }))

  const customBackground = item.customBackground?.startsWith('data:')
    ? await uploadDataUrl(`advisories/${item.id}/background.jpg`, item.customBackground)
    : item.customBackground
  const orgLogo = item.orgLogo?.startsWith('data:')
    ? await uploadDataUrl(`advisories/${item.id}/org-logo.png`, item.orgLogo)
    : item.orgLogo
  const wingLogo = item.wingLogo?.startsWith('data:')
    ? await uploadDataUrl(`advisories/${item.id}/wing-logo.png`, item.wingLogo)
    : item.wingLogo
  const videoThumbnail = item.videoThumbnail?.startsWith('data:')
    ? await uploadDataUrl(`advisories/${item.id}/thumb.jpg`, item.videoThumbnail)
    : item.videoThumbnail

  return { ...item, images, customBackground, orgLogo, wingLogo, videoThumbnail }
}

export async function prepareSettingsForCloud(settings: AppSettings): Promise<AppSettings> {
  const orgLogo = settings.orgLogo?.startsWith('data:')
    ? await uploadDataUrl('settings/org-logo.png', settings.orgLogo)
    : settings.orgLogo
  const wingLogo = settings.wingLogo?.startsWith('data:')
    ? await uploadDataUrl('settings/wing-logo.png', settings.wingLogo)
    : settings.wingLogo
  const advisoryLogo = settings.advisoryLogo?.startsWith('data:')
    ? await uploadDataUrl('settings/advisory-logo.png', settings.advisoryLogo)
    : settings.advisoryLogo
  const defaultCustomBackground = settings.defaultCustomBackground?.startsWith('data:')
    ? await uploadDataUrl('settings/default-bg.jpg', settings.defaultCustomBackground)
    : settings.defaultCustomBackground
  return { ...settings, orgLogo, wingLogo, advisoryLogo, defaultCustomBackground }
}

export async function fetchCloudState() {
  const supabase = getSupabase()
  if (!supabase) return null

  const [{ data: rows, error: aErr }, { data: libRows, error: lErr }, { data: settingRows, error: sErr }] = await Promise.all([
    supabase.from('advisories').select('payload').order('updated_at', { ascending: false }),
    supabase.from('library_items').select('payload'),
    supabase.from('app_settings').select('payload').eq('id', 'default').maybeSingle(),
  ])

  if (aErr) throw aErr
  if (lErr) throw lErr
  if (sErr) throw sErr

  const advisories = (rows || []).map(row => migrateAdvisory(row.payload as Partial<Advisory>))
  const library = (libRows || []).map(row => row.payload as LibraryItem)
  const settings = { ...EMPTY_SETTINGS, ...((settingRows?.payload as Partial<AppSettings>) || {}) }

  return {
    advisories,
    library,
    settings,
    rev: Date.now(),
  }
}

export async function upsertAdvisoryRow(item: Advisory) {
  const supabase = getSupabase()
  if (!supabase) return item
  const prepared = await prepareAdvisoryForCloud(item)
  const { error } = await supabase.from('advisories').upsert({
    id: prepared.id,
    payload: prepared,
    status: prepared.status,
    kind: prepared.kind,
    published_at: prepared.publishedAt,
    created_at: prepared.createdAt,
    updated_at: prepared.updatedAt,
  })
  if (error) throw error
  return prepared
}

export async function deleteAdvisoryRow(id: string) {
  const supabase = getSupabase()
  if (!supabase) return
  const { error } = await supabase.from('advisories').delete().eq('id', id)
  if (error) throw error
}

export async function upsertLibraryRow(item: LibraryItem) {
  const supabase = getSupabase()
  if (!supabase) return
  const { error } = await supabase.from('library_items').upsert({
    id: item.id,
    payload: item,
    created_at: item.createdAt,
  })
  if (error) throw error
}

export async function deleteLibraryRow(id: string) {
  const supabase = getSupabase()
  if (!supabase) return
  const { error } = await supabase.from('library_items').delete().eq('id', id)
  if (error) throw error
}

export async function upsertSettingsRow(settings: AppSettings) {
  const supabase = getSupabase()
  if (!supabase) return settings
  const prepared = await prepareSettingsForCloud(settings)
  const { error } = await supabase.from('app_settings').upsert({
    id: 'default',
    payload: prepared,
  })
  if (error) throw error
  return prepared
}

export async function bumpCloudView(id: string) {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.rpc('bump_advisory_view', { item_id: id })
}

export async function cloudLogin(email: string, password: string) {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Cloud database is not configured.' }
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: cloudErrorMessage(error) }
    return { ok: true, error: '' }
  } catch (err) {
    return { ok: false, error: cloudErrorMessage(err) }
  }
}

export async function cloudLogout() {
  await getSupabase()?.auth.signOut()
}

export async function cloudSession() {
  const supabase = getSupabase()
  if (!supabase) return false
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error(cloudErrorMessage(error))
      return false
    }
    return Boolean(data.session)
  } catch (err) {
    console.error(cloudErrorMessage(err))
    return false
  }
}

export function subscribeCloudAdvisories(onChange: () => void) {
  const supabase = getSupabase()
  if (!supabase) return () => {}
  const channel = supabase
    .channel('live-content')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'advisories' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'library_items' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, onChange)
    .subscribe()
  return () => {
    void supabase.removeChannel(channel)
  }
}
