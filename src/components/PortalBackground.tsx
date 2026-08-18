import userBg from '../assets/backgrounds/user-portal-background.png'
import adminBg from '../assets/backgrounds/admin-portal-background.png'

export default function PortalBackground({ variant }: { variant: 'user' | 'admin' }) {
  const src = variant === 'user' ? userBg : adminBg

  return (
    <div className={`portal-bg portal-bg-${variant} no-print`} aria-hidden="true">
      <img src={src} alt="" className="portal-bg-photo" />
      <div className="portal-overlay" />
    </div>
  )
}
