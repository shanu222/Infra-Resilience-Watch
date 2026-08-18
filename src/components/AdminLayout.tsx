import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Library, LogOut, Shield, Menu, X, ChevronRight, Globe,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/advisories', icon: FileText, label: 'Content' },
  { to: '/admin/library', icon: Library, label: 'Content Library' },
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
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ${open ? 'w-64' : 'w-64 -translate-x-full'} md:translate-x-0 md:w-64`}
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F2040 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.25)' }}>
              <Shield size={18} style={{ color: '#06B6D4' }} />
            </div>
            <div>
              <div className="text-white text-sm font-bold leading-tight">Resilience Watch</div>
              <div className="text-slate-500 text-xs">Admin Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'rgba(6,182,212,0.12)', color: '#06B6D4' } : {}}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link
            to="/user"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-sm transition-all hover:bg-white/5 mb-1"
          >
            <Globe size={17} />
            View User Portal
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 text-sm transition-all hover:bg-red-500/10"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <button type="button" onClick={() => setOpen(!open)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: '#06B6D4' }} />
            <span className="text-sm font-semibold text-slate-700">Resilience Watch Admin</span>
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
