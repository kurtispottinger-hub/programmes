import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, TrendingUp, MessageCircle, Zap, LogOut } from 'lucide-react'
import ParentHome from './ParentHome'
import ParentProgress from './ParentProgress'
import ParentMessages from './ParentMessages'

const NAV = [
  { to: '/parent', icon: Home, label: 'Home', end: true },
  { to: '/parent/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/parent/messages', icon: MessageCircle, label: 'Messages' },
]

export default function ParentDashboard() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-navy-900 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <span className="font-display text-base font-bold text-navy-900 uppercase tracking-wide leading-none">Game IQ</span>
            <p className="text-gray-400 text-[9px] tracking-widest uppercase">Parent View</p>
          </div>
        </div>
        <button onClick={signOut} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main>
        <Routes>
          <Route index element={<ParentHome />} />
          <Route path="progress" element={<ParentProgress />} />
          <Route path="messages" element={<ParentMessages />} />
          <Route path="*" element={<Navigate to="/parent" replace />} />
        </Routes>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100">
        <div className="flex">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-150
                ${isActive ? 'text-navy-800' : 'text-gray-300 hover:text-gray-500'}`
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
