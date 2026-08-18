export default function PortalBackground({ variant }: { variant: 'user' | 'admin' }) {
  const src = variant === 'user'
    ? '/backgrounds/user-portal-background.png'
    : '/backgrounds/admin-portal-background.png'

  return (
    <div className={`portal-bg portal-bg-${variant} no-print`} aria-hidden="true">
      <div className="portal-bg-image" style={{ backgroundImage: `url("${src}")` }} />
      <div className="portal-overlay" />
    </div>
  )
}
