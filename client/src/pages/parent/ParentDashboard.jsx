import { useAuth } from '../../context/AuthContext'
import { Home, TrendingUp, MessageCircle, LogOut, Zap } from 'lucide-react'

export default function ParentDashboard() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-navy-900 uppercase tracking-wide">Game IQ</span>
            <p className="text-gray-400 text-[10px] tracking-widest uppercase -mt-0.5">Parent View</p>
          </div>
        </div>
        <button onClick={signOut} className="text-gray-400 hover:text-gray-700 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="px-4 pt-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Hello, {profile?.name?.split(' ')[0] || 'Parent'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">Track your child's development progress.</p>

        {/* Stage complete notice */}
        <div className="bg-navy-900 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Stage 1 Complete</h2>
          <p className="text-white/50 text-sm max-w-xs mx-auto">
            Your parent portal is being set up. Stage 4 will build out your full progress view, reports, and message thread.
          </p>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-3">
        <div className="flex justify-around">
          {[
            { icon: Home, label: 'Home', active: true },
            { icon: TrendingUp, label: 'Progress' },
            { icon: MessageCircle, label: 'Messages' },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200
                ${active ? 'text-navy-800' : 'text-gray-400 hover:text-gray-700'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
