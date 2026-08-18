import type { Advisory, AppSettings, LibraryItem } from '../types'
import { normalizeSeverity } from './constants'
import { DEFAULT_LIBRARY_ITEMS } from './templates'

export const EMPTY_SETTINGS: AppSettings = {
  orgLogo: '',
  wingLogo: '',
  advisoryLogo: '',
  defaultBackgroundTemplate: 'ndma-blue',
  defaultCustomBackground: '',
  defaultTheme: 'blue-engineering',
}

export function migrateAdvisory(raw: Partial<Advisory> & { id?: string }): Advisory {
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
    severity: normalizeSeverity(raw.severity),
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

export function defaultLibrary(): LibraryItem[] {
  return DEFAULT_LIBRARY_ITEMS.map((item, i) => ({
    ...item,
    id: `lib_${i}`,
    createdAt: new Date().toISOString(),
  }))
}
