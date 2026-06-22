import { useAuth } from '../../context/AuthContext'
import { Home, Dumbbell, Gamepad2, BookOpen, MessageCircle, FileText, LogOut, Zap } from 'lucide-react'

export default function PlayerDashboard() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-navy-950 pb-24">
      {/* Top header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-navy-900" />
          </div>
          <span className="font-display text-xl font-bold text-white uppercase tracking-wide">Game IQ</span>
        </div>
        <button onClick={signOut} className="text-white/30 hover:text-white/60 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="px-4 pt-4">
        <p className="text-white/50 text-sm mb-6">
          Welcome back, {profile?.name?.split(' ')[0] || 'Player'}
        </p>

        {/* Stage complete notice */}
        <div className="card-glass p-8 text-center mt-8">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Stage 1 Complete</h2>
          <p className="text-white/50 text-sm max-w-xs mx-auto">
            Your player portal is being built. Stage 3 will bring your home screen, game log, homework, and development plan.
          </p>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-white/10 px-2 py-3">
        <div className="flex justify-around">
          {[
            { icon: Home, label: 'Home', active: true },
            { icon: Dumbbell, label: 'Develop' },
            { icon: Gamepad2, label: 'Games' },
            { icon: BookOpen, label: 'Homework' },
            { icon: MessageCircle, label: 'Messages' },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200
                ${active ? 'text-accent' : 'text-white/30 hover:text-white/60'}`}
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
