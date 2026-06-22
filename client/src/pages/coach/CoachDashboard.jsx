import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Zap } from 'lucide-react'

export default function CoachDashboard() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-navy-900" />
            </div>
            <span className="font-display text-xl font-bold text-white uppercase tracking-wide">Game IQ</span>
          </div>
          <p className="text-white/30 text-xs mt-1 tracking-widest uppercase">Coach Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Home', active: true },
            { icon: Users, label: 'Players' },
            { icon: FileText, label: 'Reports' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${active
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-semibold text-sm">K</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{profile?.name || 'Coach Kurtis'}</p>
              <p className="text-white/30 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors px-2 py-2 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-navy-900" />
            </div>
            <span className="font-display text-xl font-bold text-navy-900 uppercase tracking-wide">Game IQ</span>
          </div>
          <button onClick={signOut} className="text-gray-500 hover:text-gray-800 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name?.split(' ')[0] || 'Coach'}
          </h1>
          <p className="text-gray-500 mb-8">Your player roster and activity at a glance.</p>

          {/* Stage complete notice */}
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Stage 1 Complete</h2>
            <p className="text-white/50 text-sm max-w-xs mx-auto">
              Authentication and routing are set up. Stage 2 will build out the full coach dashboard with player roster, session notes, and more.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
