import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'
import { BRAND } from '../data/constants'

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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <header className="sticky top-0 z-30 border-b border-white/10" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F2040 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
              <Shield size={20} style={{ color: '#06B6D4' }} />
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
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
                style={({ isActive }) => isActive ? { background: 'rgba(6,182,212,0.15)', color: '#22D3EE' } : {}}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="lg:hidden ml-auto p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            onClick={() => setOpen(v => !v)}
            aria-label="Open navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-slate-300'}`
                }
                style={({ isActive }) => isActive ? { background: 'rgba(6,182,212,0.12)' } : {}}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: '#06B6D4' }} />
            <span className="text-sm text-slate-500">{BRAND.shortName} · {BRAND.description}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
