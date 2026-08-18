import { useState, useEffect } from 'react'
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import PortalBackground from '../components/PortalBackground'
import { pingCloud } from '../data/cloud'

export default function AdminLogin() {
  const { login, isAuthenticated, cloudEnabled, ready } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cloudStatus, setCloudStatus] = useState<'checking' | 'ok' | 'fail'>('checking')
  const [cloudStatusMsg, setCloudStatusMsg] = useState('')

  useEffect(() => {
    if (ready && isAuthenticated) navigate('/admin/dashboard', { replace: true })
  }, [isAuthenticated, navigate, ready])

  useEffect(() => {
    if (!cloudEnabled) {
      setCloudStatus('ok')
      return
    }
    let live = true
    void pingCloud().then(result => {
      if (!live) return
      if (result.ok) {
        setCloudStatus('ok')
        setCloudStatusMsg('')
      } else {
        setCloudStatus('fail')
        setCloudStatusMsg(result.error || 'Cannot reach Supabase.')
      }
    })
    return () => { live = false }
  }, [cloudEnabled])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(username.trim(), password)
      if (result.ok) {
        navigate('/admin/dashboard')
      } else {
        setError(result.error || 'Invalid credentials. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-shell min-h-screen flex items-center justify-center p-4">
      <PortalBackground variant="admin" />
      <div className="portal-content relative w-full max-w-md px-1">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <Shield size={32} style={{ color: '#06B6D4' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>
            Admin Portal
          </h1>
          <p className="text-slate-200 text-sm">Infrastructure Resilience Watch</p>
        </div>

        <div className="login-panel rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                {cloudEnabled ? 'Email' : 'Username'}
              </label>
              <input
                type={cloudEnabled ? 'email' : 'text'}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={cloudEnabled ? 'shanu1998email@gmail.com' : 'admin'}
                required
                autoComplete={cloudEnabled ? 'email' : 'username'}
                className="login-field w-full px-4 py-3 rounded-xl text-sm placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="login-field w-full px-4 py-3 pr-12 rounded-xl text-sm placeholder-slate-400"
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
              <div className="glass-panel-error px-4 py-3 rounded-xl text-sm">
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

          {cloudEnabled ? (
            <div className={`mt-6 p-4 rounded-xl text-sm ${cloudStatus === 'fail' ? 'glass-panel-error' : cloudStatus === 'checking' ? 'glass-panel-warning' : 'glass-panel-success'}`}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2">
                {cloudStatus === 'checking' ? 'Checking cloud database…' : cloudStatus === 'fail' ? 'Cloud database unreachable' : 'Cloud database connected'}
              </div>
              {cloudStatus === 'fail' ? (
                <p className="text-xs leading-relaxed">{cloudStatusMsg}</p>
              ) : cloudStatus === 'checking' ? (
                <p className="text-xs leading-relaxed">Verifying connection to Supabase…</p>
              ) : (
                <p className="text-xs leading-relaxed">
                  Sign in with the <strong>exact email</strong> from Supabase Authentication → Users (for example <code className="font-mono">shanu1998email@gmail.com</code>). Published content appears on the User Portal for everyone.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div className="text-xs text-amber-200 font-semibold uppercase tracking-wider mb-2">Local demo only</div>
              <p className="text-xs text-amber-100/80 leading-relaxed mb-2">No cloud database is connected. Published items stay in this browser until you add Supabase keys. See README.</p>
              <div className="text-xs font-mono text-cyan-300">Username: <span className="text-white">admin</span></div>
              <div className="text-xs font-mono text-cyan-300 mt-1">Password: <span className="text-white">Admin@2026</span></div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-200 mt-6">
          Authorized personnel only. Create, publish and manage infrastructure intelligence.
        </p>
      </div>
    </div>
  )
}
