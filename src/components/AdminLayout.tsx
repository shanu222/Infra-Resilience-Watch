import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Library, LogOut, Shield, Menu, X, ChevronRight, Globe, Plus, Settings, AlertTriangle, Play, Wrench,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import PortalBackground from './PortalBackground'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/advisories/new?kind=advisory', icon: Plus, label: 'Create Advisory' },
  { to: '/admin/advisories', icon: FileText, label: 'Content Library' },
  { to: '/admin/advisories?kind=issue', icon: AlertTriangle, label: 'Issues' },
  { to: '/admin/advisories?kind=video', icon: Play, label: 'Videos' },
  { to: '/admin/advisories?kind=solution', icon: Wrench, label: 'Solutions' },
  { to: '/admin/library', icon: Library, label: 'Reusable Notes' },
  { to: '/admin/settings', icon: Settings, label: 'Document Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="portal-shell portal-scifi-grid">
      <PortalBackground variant="admin" />
      <div className="portal-content min-h-screen flex">
        <aside
          id="admin-sidebar"
          className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 md:w-20 lg:w-64 transition-transform duration-300 glass-sidebar no-print ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
          style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="p-4 lg:p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3 md:justify-center lg:justify-start">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0" style={{ background: 'rgba(22,184,212,0.15)', border: '1px solid rgba(22,184,212,0.25)' }}>
                <Shield size={18} style={{ color: '#16B8D4' }} />
              </div>
              <div className="md:hidden lg:block">
                <div className="text-white text-sm font-bold leading-tight">Resilience Watch</div>
                <div className="text-slate-400 text-xs">Admin Portal</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Admin">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                title={label}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `sidebar-scifi-link flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium md:justify-center lg:justify-start md:px-2 lg:px-4 ${
                    isActive ? 'sidebar-scifi-active' : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className="shrink-0" />
                    <span className="md:hidden lg:inline">{label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto hidden lg:block" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Link
              to="/"
              title="View User Portal"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-sm transition-all hover:bg-white/5 mb-1 md:justify-center lg:justify-start md:px-2 lg:px-4"
            >
              <Globe size={17} className="shrink-0" />
              <span className="md:hidden lg:inline">View User Portal</span>
            </Link>
            <button
              type="button"
              title="Sign Out"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-red-400 text-sm transition-all hover:bg-red-500/10 md:justify-center lg:justify-start md:px-2 lg:px-4"
            >
              <LogOut size={17} className="shrink-0" />
              <span className="md:hidden lg:inline">Sign Out</span>
            </button>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden no-print" onClick={() => setOpen(false)} />
        )}

        <div className="flex-1 md:ml-20 lg:ml-64 flex flex-col min-h-screen min-w-0">
          <div className="md:hidden no-print flex items-center gap-3 px-4 py-3 glass-nav">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-white hover:bg-white/10"
              aria-label={open ? 'Close admin menu' : 'Open admin menu'}
              aria-expanded={open}
              aria-controls="admin-sidebar"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Shield size={16} style={{ color: '#16B8D4' }} />
              <span className="text-sm font-semibold text-white truncate">Resilience Watch Admin</span>
            </div>
          </div>

          <main id="main-content" className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
