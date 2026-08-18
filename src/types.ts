export type Severity = 'Normal' | 'Advisory' | 'High' | 'Critical'
export type Status = 'Draft' | 'Review' | 'Published' | 'Scheduled' | 'Archived'
export type HazardType =
  | 'Flood'
  | 'Flash Flood'
  | 'Urban Flooding'
  | 'Earthquake'
  | 'GLOF'
  | 'Landslide'
  | 'Avalanche'
  | 'Cyclone'
  | 'Windstorm'
  | 'Heavy Rainfall'
  | 'Urban Fire'
  | 'Drought'
  | 'Extreme Heat'
  | 'Multi-Hazard'
  | 'Other'

export type AdvisoryType =
  | 'Infrastructure Advisory'
  | 'Construction Advisory'
  | 'Emergency Advisory'
  | 'Preventive Advisory'
  | 'Technical Advisory'
  | 'Public Safety Advisory'

export type ContentKind =
  | 'issue'
  | 'advisory'
  | 'solution'
  | 'video'
  | 'case-study'
  | 'observation'

export type IssueType =
  | 'Infrastructure Problem'
  | 'Infrastructure Risk'
  | 'Field Observation'
  | 'Disaster Issue'
  | 'Damage Observation'
  | 'Preventive Measure'
  | 'Recovery Recommendation'
  | 'Build Back Better'

export type DocumentTheme =
  | 'blue-engineering'
  | 'green-resilience'
  | 'red-alert'
  | 'orange-recovery'
  | 'navy-government'
  | 'clean-professional'

export type BackgroundTemplate =
  | 'ndma-blue'
  | 'engineering-grid'
  | 'resilience-blue'
  | 'infra-technical'
  | 'disaster-alert'
  | 'clean-government'
  | 'green-resilience'
  | 'custom'

export interface AdvisoryImage {
  id: string
  dataUrl: string
  caption: string
  isCover: boolean
  order: number
}

export interface AppSettings {
  orgLogo: string
  wingLogo: string
  advisoryLogo: string
  defaultBackgroundTemplate: BackgroundTemplate
  defaultCustomBackground: string
  defaultTheme: DocumentTheme
}

export interface Advisory {
  id: string
  kind: ContentKind
  issueType: IssueType | ''
  shortSummary: string
  videoUrl: string
  videoTitle: string
  videoDescription: string
  videoThumbnail: string
  videoDuration: string
  featured: boolean
  title: string
  advisoryNumber: string
  type: AdvisoryType
  hazard: HazardType
  severity: Severity
  province: string
  district: string
  specificLocation: string
  infrastructureTypes: string[]
  currentSituation: string
  identifiedProblem: string
  observedConditions: string
  affectedInfrastructure: string[]
  weatherCondition: string
  rainfallCondition: string
  riverCondition: string
  groundCondition: string
  visibility: string
  otherCondition: string
  risks: string
  immediateActions: string[]
  shortTermMeasures: string[]
  mediumTermMeasures: string[]
  longTermMeasures: string[]
  dos: string[]
  donts: string[]
  engineeringRecommendations: string[]
  publicGuidance: string
  contactInfo: string
  images: AdvisoryImage[]
  references: string
  keyTakeaway: string
  documentTheme: DocumentTheme
  backgroundTemplate: BackgroundTemplate
  customBackground: string
  orgLogo: string
  wingLogo: string
  status: Status
  version: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  expiryDate: string | null
  publishDate: string | null
  viewCount: number
}

export interface Template {
  id: string
  name: string
  hazard: HazardType
  description: string
  risks: string
  immediateActions: string[]
  shortTermMeasures: string[]
  longTermMeasures: string[]
  dos: string[]
  donts: string[]
  engineeringRecommendations: string[]
}

export interface LibraryItem {
  id: string
  category: 'Measure' | 'Do' | "Don't" | 'Engineering' | 'Guidance' | 'Reference'
  hazard: HazardType | 'General'
  infrastructure: string
  text: string
  createdAt: string
}

export interface ContentFilters {
  hazard: HazardType | ''
  province: string
  district: string
  infrastructureType: string
  issueType: string
  keyword: string
}
