import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, Dumbbell, Gamepad2, BookOpen, MessageCircle, Zap, LogOut } from 'lucide-react'
import PlayerHome from './PlayerHome'
import PlayerDevelopment from './PlayerDevelopment'
import GameLog from './GameLog'
import PlayerHomework from './PlayerHomework'
import PlayerMessages from './PlayerMessages'
import PlayerReports from './PlayerReports'

const NAV = [
  { to: '/player', icon: Home, label: 'Home', end: true },
  { to: '/player/develop', icon: Dumbbell, label: 'Develop' },
  { to: '/player/games', icon: Gamepad2, label: 'Games' },
  { to: '/player/homework', icon: BookOpen, label: 'Homework' },
  { to: '/player/messages', icon: MessageCircle, label: 'Messages' },
]

export default function PlayerDashboard() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-navy-950 pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-navy-950/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-navy-900" />
          </div>
          <span className="font-display text-lg font-bold text-white uppercase tracking-wide">Game IQ</span>
        </div>
        <button onClick={signOut} className="text-white/25 hover:text-white/50 transition-colors p-1">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Routes */}
      <main>
        <Routes>
          <Route index element={<PlayerHome />} />
          <Route path="develop" element={<PlayerDevelopment />} />
          <Route path="games" element={<GameLog />} />
          <Route path="homework" element={<PlayerHomework />} />
          <Route path="messages" element={<PlayerMessages />} />
          <Route path="reports" element={<PlayerReports />} />
          <Route path="*" element={<Navigate to="/player" replace />} />
        </Routes>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-navy-900/95 backdrop-blur-sm border-t border-white/8">
        <div className="flex">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-150
                ${isActive ? 'text-accent' : 'text-white/25 hover:text-white/50'}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
