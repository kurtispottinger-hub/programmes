import { useAuth } from '../../context/AuthContext'
import { useMyPlayerProfile } from '../../hooks/useSupabase'
import { Loader2, Target, Award, Calendar, Zap } from 'lucide-react'

function AttributeBar({ label, value, max = 10 }) {
  const pct = Math.round((value / max) * 100)
  const color = pct >= 70 ? 'bg-green-400' : pct >= 40 ? 'bg-accent' : 'bg-white/30'
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/70 text-sm">{label}</span>
        <span className="text-white font-bold text-sm">{value}<span className="text-white/30 font-normal">/{max}</span></span>
      </div>
      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function TimelineItem({ label, date, first }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${first ? 'bg-accent' : 'bg-white/20'}`} />
        <div className="w-px flex-1 bg-white/8 mt-1" style={{ minHeight: 28 }} />
      </div>
      <div className="pb-4">
        <p className="text-white/80 text-sm font-medium">{label}</p>
        {date && <p className="text-white/30 text-xs mt-0.5">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
      </div>
    </div>
  )
}

export default function PlayerDevelopment() {
  const { user } = useAuth()
  const { data: player, loading } = useMyPlayerProfile(user?.id)

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
  }

  const name = player?.users?.name || 'Player'
  const firstName = name.split(' ')[0]
  const gamesLogged = player?.game_logs?.length || 0
  const hwCompleted = player?.homework?.filter(h => h.completed).length || 0
  const reportsSent = player?.reports?.filter(r => r.sent_at).length || 0
  const firstGame = player?.game_logs?.sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  // Build timeline events
  const events = [
    player?.join_date && { label: `Joined Game IQ`, date: player.join_date },
    firstGame && { label: 'First game logged', date: firstGame.date },
    ...(player?.milestones || []).map(m => ({ label: m.badge_name, date: m.awarded_at })),
    reportsSent > 0 && { label: `${reportsSent} monthly report${reportsSent > 1 ? 's' : ''} received`, date: null },
  ].filter(Boolean).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))

  return (
    <div className="px-4 py-5 space-y-5 pb-6">
      <h1 className="text-white text-2xl font-bold">My Development</h1>

      {/* Current focus */}
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-accent" />
          <p className="text-accent text-xs font-bold uppercase tracking-wider">Current Focus</p>
        </div>
        {player?.development_focus ? (
          <p className="text-white text-base leading-relaxed">{player.development_focus}</p>
        ) : (
          <p className="text-white/30 text-sm italic">Coach Kurtis will set your focus area soon.</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Games', value: gamesLogged, icon: '⚽' },
          { label: 'Homework', value: hwCompleted, icon: '✅' },
          { label: 'Reports', value: reportsSent, icon: '📋' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-white text-xl font-bold">{value}</p>
            <p className="text-white/30 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Milestones */}
      {(player?.milestones?.length || 0) > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-white font-semibold">Milestones</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {player.milestones.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-amber-400/8 border border-amber-400/15 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{m.badge_name}</p>
                  {m.badge_description && <p className="text-white/40 text-xs mt-0.5">{m.badge_description}</p>}
                  <p className="text-amber-400/50 text-xs mt-0.5">
                    {new Date(m.awarded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress timeline */}
      {events.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-white/40" />
            <h2 className="text-white font-semibold">Your Journey</h2>
          </div>
          <div className="pl-1">
            {events.map((ev, i) => (
              <TimelineItem key={i} label={ev.label} date={ev.date} first={i === events.length - 1} />
            ))}
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0" />
              <p className="text-accent text-sm font-medium">Today</p>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">Your journey starts when you log your first game.</p>
        </div>
      )}
    </div>
  )
}
