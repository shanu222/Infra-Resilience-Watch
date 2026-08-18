import { useState, useEffect } from 'react'
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import PortalBackground from '../components/PortalBackground'

export default function AdminLogin() {
  const { login, isAuthenticated } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const ok = login(username.trim(), password)
    setLoading(false)
    if (ok) {
      navigate('/admin/dashboard')
    } else {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="portal-shell min-h-screen flex items-center justify-center p-4">
      <PortalBackground variant="admin" />
      <div className="portal-content relative w-full max-w-md px-1">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <Shield size={32} style={{ color: '#06B6D4' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>
            Admin Portal
          </h1>
          <p className="text-slate-200 text-sm">Infrastructure Resilience Watch</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-500 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#06B6D4' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white text-sm placeholder-slate-500"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#06B6D4' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? 'rgba(6,182,212,0.5)' : 'linear-gradient(135deg, #0369A1, #06B6D4)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)' }}>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Demo Credentials</div>
            <div className="text-xs font-mono text-cyan-300">Username: <span className="text-white">admin</span></div>
            <div className="text-xs font-mono text-cyan-300 mt-1">Password: <span className="text-white">Admin@2026</span></div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-200 mt-6">
          Authorized personnel only. Create, publish and manage infrastructure intelligence.
        </p>
      </div>
    </div>
  )
}
