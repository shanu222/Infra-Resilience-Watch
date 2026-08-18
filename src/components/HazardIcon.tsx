import {
  Waves, Zap, Building2, Activity, Mountain, Wind, Flame, Sun, Thermometer,
  AlertTriangle, CloudRain, HelpCircle, Snowflake,
} from 'lucide-react'
import type { HazardType } from '../types'

const MAP: Record<HazardType, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  Flood: { icon: Waves, color: '#1D4ED8', bg: '#dbeafe' },
  'Flash Flood': { icon: Zap, color: '#7C3AED', bg: '#ede9fe' },
  'Urban Flooding': { icon: Building2, color: '#0E7490', bg: '#cffafe' },
  Earthquake: { icon: Activity, color: '#92400E', bg: '#fef3c7' },
  GLOF: { icon: Mountain, color: '#0369A1', bg: '#e0f2fe' },
  Landslide: { icon: Mountain, color: '#78350F', bg: '#fef3c7' },
  Avalanche: { icon: Snowflake, color: '#1E3A5F', bg: '#dbeafe' },
  Cyclone: { icon: Wind, color: '#6D28D9', bg: '#ede9fe' },
  Windstorm: { icon: Wind, color: '#4B5563', bg: '#f3f4f6' },
  'Heavy Rainfall': { icon: CloudRain, color: '#1E40AF', bg: '#dbeafe' },
  'Urban Fire': { icon: Flame, color: '#B91C1C', bg: '#fee2e2' },
  Drought: { icon: Sun, color: '#B45309', bg: '#fef3c7' },
  'Extreme Heat': { icon: Thermometer, color: '#DC2626', bg: '#fee2e2' },
  'Multi-Hazard': { icon: AlertTriangle, color: '#92400E', bg: '#fef3c7' },
  Other: { icon: HelpCircle, color: '#374151', bg: '#f3f4f6' },
}

interface Props {
  hazard: HazardType
  size?: number
  showLabel?: boolean
  className?: string
}

export default function HazardIcon({ hazard, size = 20, showLabel = false, className = '' }: Props) {
  const { icon: Icon, color, bg } = MAP[hazard] || MAP['Other']
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="inline-flex items-center justify-center rounded-lg"
        style={{ background: bg, padding: size * 0.4, color }}
      >
        <Icon size={size} />
      </span>
      {showLabel && <span className="font-semibold" style={{ color }}>{hazard}</span>}
    </span>
  )
}

export function hazardColor(hazard: HazardType): string {
  return MAP[hazard]?.color || '#374151'
}

export function hazardBg(hazard: HazardType): string {
  return MAP[hazard]?.bg || '#f3f4f6'
}
