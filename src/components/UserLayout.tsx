import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'
import { BRAND } from '../data/constants'
import PortalBackground from './PortalBackground'
import { useApp } from '../contexts/AppContext'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/watch', label: "Today's Watch" },
  { to: '/issues', label: 'Issues' },
  { to: '/advisories', label: 'Advisories' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/videos', label: 'Videos' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/about', label: 'About' },
]

export default function UserLayout() {
  const [open, setOpen] = useState(false)
  const { ready, cloudEnabled, cloudError } = useApp()

  return (
    <div className="portal-shell">
      <PortalBackground variant="user" />
      <div className="portal-content flex flex-col min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-white focus:text-navy no-print">
          Skip to content
        </a>
        <header className="sticky top-0 z-30 glass-nav no-print">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: 'rgba(22,184,212,0.15)', border: '1px solid rgba(22,184,212,0.3)' }}>
                <Shield size={20} style={{ color: '#16B8D4' }} />
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-bold tracking-tight leading-tight truncate">{BRAND.name}</div>
                <div className="text-[11px] text-cyan-300 tracking-wide truncate">{BRAND.tagline}</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 ml-auto">
              {NAV.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      isActive ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) => isActive ? { background: 'rgba(22,184,212,0.18)', color: '#22D3EE' } : {}}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className="lg:hidden ml-auto p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10"
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Close navigation' : 'Open navigation'}
              aria-expanded={open}
              aria-controls="user-nav-drawer"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {open && (
            <div id="user-nav-drawer" className="lg:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              {NAV.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-slate-200'}`
                  }
                  style={({ isActive }) => isActive ? { background: 'rgba(22,184,212,0.12)' } : {}}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </header>

        <main id="main-content" className="flex-1 min-w-0">
          {cloudError && (
            <div className="max-w-7xl mx-auto px-4 pt-4 no-print">
              <div className="glass-panel-error rounded-xl px-4 py-3 text-sm">
                {cloudError}
              </div>
            </div>
          )}
          {cloudEnabled && !ready ? (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-200 text-sm">Loading published content…</div>
          ) : (
            <Outlet />
          )}
        </main>

        <footer className="no-print mt-auto py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="glass-panel rounded-2xl px-4 py-4 flex items-center gap-2">
              <Shield size={16} style={{ color: '#16B8D4' }} />
              <span className="text-sm text-slate-700">{BRAND.shortName} · {BRAND.description}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
