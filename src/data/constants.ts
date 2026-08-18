import type { AdvisoryType, ContentKind, HazardType, IssueType, Severity } from '../types'

export const HAZARDS: HazardType[] = [
  'Flood', 'Flash Flood', 'Urban Flooding', 'Earthquake', 'GLOF', 'Landslide',
  'Avalanche', 'Cyclone', 'Windstorm', 'Heavy Rainfall', 'Urban Fire',
  'Drought', 'Extreme Heat', 'Multi-Hazard', 'Other',
]

export const ADVISORY_TYPES: AdvisoryType[] = [
  'Infrastructure Advisory',
  'Construction Advisory',
  'Emergency Advisory',
  'Preventive Advisory',
  'Technical Advisory',
  'Public Safety Advisory',
]

export const SEVERITIES: Severity[] = ['Normal', 'Low', 'Moderate', 'High', 'Critical']

/** Maps legacy stored values (e.g. Advisory) to current severity terms. */
export function normalizeSeverity(value?: string): Severity {
  if (value === 'Advisory') return 'Moderate'
  if (value && (SEVERITIES as readonly string[]).includes(value)) return value as Severity
  return 'Moderate'
}

export const INFRA_TYPES = [
  'Roads', 'Bridges', 'Buildings', 'Schools', 'Hospitals',
  'Drainage', 'Water Supply', 'Power', 'Communication', 'Other',
]

export const ISSUE_TYPES: IssueType[] = [
  'Infrastructure Problem',
  'Infrastructure Risk',
  'Field Observation',
  'Disaster Issue',
  'Damage Observation',
  'Preventive Measure',
  'Recovery Recommendation',
  'Build Back Better',
]

export const CONTENT_KINDS: { id: ContentKind; label: string; plural: string; description: string }[] = [
  { id: 'issue', label: 'Issue', plural: 'Issues', description: 'Infrastructure problems, risks and field observations' },
  { id: 'advisory', label: 'Advisory', plural: 'Advisories', description: 'Official guidance and hazard advisories' },
  { id: 'solution', label: 'Solution', plural: 'Solutions', description: 'Engineering recommendations and resilience practices' },
  { id: 'video', label: 'Video', plural: 'Videos', description: 'Field footage and briefing videos' },
  { id: 'case-study', label: 'Case Study', plural: 'Case Studies', description: 'Documented recovery and Build Back Better cases' },
  { id: 'observation', label: 'Observation', plural: 'Observations', description: 'Photographs and field notes' },
]

export const KIND_LABEL: Record<ContentKind, string> = {
  issue: 'Issue',
  advisory: 'Advisory',
  solution: 'Solution',
  video: 'Video',
  'case-study': 'Case Study',
  observation: 'Observation',
}

export const BRAND = {
  name: 'INFRASTRUCTURE RESILIENCE WATCH',
  shortName: 'Resilience Watch',
  tagline: 'Observe \u2022 Assess \u2022 Advise \u2022 Build Resilience',
  description: 'Daily infrastructure intelligence, risks, issues, advisories and resilient solutions for Pakistan.',
  heroLine: 'Daily intelligence on infrastructure risks, issues and resilient solutions across Pakistan.',
  landingLine: 'Daily infrastructure intelligence, risks and resilient solutions across Pakistan.',
  pipeline: ['Observe', 'Identify', 'Assess', 'Advise', 'Solve', 'Build Resilience'] as const,
}
