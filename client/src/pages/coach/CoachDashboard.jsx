import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, FileText, LogOut, Zap, Menu, X, ChevronRight
} from 'lucide-react'
import CoachHome from './CoachHome'
import PlayerProfile from './PlayerProfile'
import AddPlayer from './AddPlayer'

const NAV = [
  { to: '/coach', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/coach/players', icon: Users, label: 'Players' },
  { to: '/coach/add-player', icon: FileText, label: 'Add Player' },
]

export default function CoachDashboard() {
  const { profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'CK'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="w-60 bg-navy-900 flex-col hidden md:flex fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-navy-900" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-white uppercase tracking-wide leading-none">Game IQ</span>
              <p className="text-white/25 text-[10px] tracking-widest uppercase mt-0.5">Coach Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold text-xs">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile?.name || 'Coach Kurtis'}</p>
              <p className="text-white/30 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 text-white/35 hover:text-white/70 text-sm transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-60 bg-navy-900 flex flex-col">
            <div className="p-5 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Zap className="w-4 h-4 text-navy-900" />
                </div>
                <span className="font-display text-lg font-bold text-white uppercase tracking-wide">Game IQ</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive ? 'bg-accent/15 text-accent' : 'text-white/45 hover:text-white hover:bg-white/5'}`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-white/8">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 text-white/35 hover:text-white/70 text-sm px-3 py-2 rounded-xl hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-gray-800">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-navy-900 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-display text-base font-bold text-navy-900 uppercase tracking-wide">Game IQ</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Routes>
            <Route index element={<CoachHome onViewPlayer={id => navigate(`/coach/players/${id}`)} />} />
            <Route path="players" element={<CoachHome onViewPlayer={id => navigate(`/coach/players/${id}`)} />} />
            <Route path="players/:playerId" element={<PlayerProfile />} />
            <Route path="add-player" element={<AddPlayer />} />
            <Route path="*" element={<Navigate to="/coach" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
