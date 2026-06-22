import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Zap } from 'lucide-react'

const ROLE_CONFIG = {
  coach: {
    label: 'Coach',
    description: 'Kurtis — full admin access',
    redirect: '/coach',
  },
  player: {
    label: 'Player',
    description: 'Access your development portal',
    redirect: '/player',
  },
  parent: {
    label: 'Parent',
    description: 'Track your child\'s progress',
    redirect: '/parent',
  },
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      // Navigation handled by App.jsx based on role from profile
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo / Brand */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="w-5 h-5 text-navy-900" />
          </div>
          <span className="font-display text-3xl font-bold tracking-wide text-white uppercase">
            Game IQ
          </span>
        </div>
        <p className="text-white/40 text-sm tracking-widest uppercase">Powered by Coach Kurtis</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Role selector */}
        {!selectedRole ? (
          <div className="space-y-3">
            <p className="text-white/60 text-sm text-center mb-6">Who are you logging in as?</p>
            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className="w-full card-glass p-4 text-left transition-all duration-200 hover:bg-white/10 hover:border-accent/40 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white group-hover:text-accent transition-colors">{config.label}</p>
                    <p className="text-sm text-white/40 mt-0.5">{config.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent/40 transition-colors">
                    <span className="text-white/30 group-hover:text-accent text-lg leading-none">›</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            {/* Back + role label */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setSelectedRole(null); setError('') }}
                className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-1"
              >
                ‹ Back
              </button>
              <span className="text-white/20">|</span>
              <span className="text-accent text-sm font-medium">
                {ROLE_CONFIG[selectedRole].label} Login
              </span>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        )}
      </div>

      <p className="mt-12 text-white/20 text-xs text-center">
        Game IQ © 2026 · Coach Kurtis
      </p>
    </div>
  )
}
