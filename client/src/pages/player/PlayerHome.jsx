import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMyPlayerProfile } from '../../hooks/useSupabase'
import {
  Flame, BookOpen, Gamepad2, ChevronRight, Award, Zap,
  MessageCircle, Loader2, Star
} from 'lucide-react'

function StreakFlame({ count }) {
  const isHot = count >= 3
  return (
    <div className="flex items-center gap-1.5">
      <Flame className={`w-5 h-5 ${isHot ? 'text-orange-400' : 'text-white/30'}`} />
      <span className={`text-2xl font-bold ${isHot ? 'text-orange-400' : 'text-white/50'}`}>{count}</span>
      <span className="text-white/30 text-sm">week{count !== 1 ? 's' : ''}</span>
    </div>
  )
}

// Premium Game IQ player card
function PlayerCard({ player, name }) {
  const tier = player?.programme_tier || 'GIA'
  const position = player?.position || 'Player'
  const focus = player?.development_focus

  return (
    <div className="relative rounded-3xl overflow-hidden mx-4 mt-4"
      style={{ background: 'linear-gradient(135deg, #0a1540 0%, #060d2b 60%, #03071a 100%)' }}>
      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
                <Zap className="w-3 h-3 text-navy-900" />
              </div>
              <span className="text-accent text-xs font-bold tracking-widest uppercase">Game IQ</span>
            </div>
            <h2 className="text-white font-display text-2xl font-bold leading-tight">{name}</h2>
          </div>
          <div className="text-right">
            <div className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Programme</div>
            <div className="text-accent text-xs font-bold">{tier}</div>
          </div>
        </div>

        {/* Position + focus */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Position</p>
            <p className="text-white font-semibold text-sm">{position}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Streak</p>
            <StreakFlame count={player?.streak_count || 0} />
          </div>
        </div>

        {/* Current focus */}
        {focus && (
          <div className="bg-accent/8 border border-accent/15 rounded-xl p-3 mb-1">
            <p className="text-accent/60 text-[10px] uppercase tracking-wider mb-1">Current Focus</p>
            <p className="text-white/85 text-sm leading-snug">{focus}</p>
          </div>
        )}

        {/* Milestones strip */}
        {(player?.milestones?.length || 0) > 0 && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
            <Award className="w-3.5 h-3.5 text-amber-400/60" />
            <span className="text-white/30 text-xs">{player.milestones.length} milestone{player.milestones.length !== 1 ? 's' : ''} earned</span>
          </div>
        )}
      </div>
    </div>
  )
}

function HomeworkPreview({ homework, onClick }) {
  const active = homework?.filter(h => !h.completed).sort((a, b) => new Date(a.due_date || '9999') - new Date(b.due_date || '9999'))[0]
  if (!active) return null

  return (
    <button onClick={onClick}
      className="mx-4 w-[calc(100%-2rem)] bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:bg-white/8 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">This Week's Homework</p>
            <p className="text-white font-semibold text-sm">{active.title}</p>
            {active.description && <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{active.description}</p>}
            {active.due_date && (
              <p className="text-white/30 text-xs mt-1">
                Due {new Date(active.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 flex-shrink-0 mt-1" />
      </div>
    </button>
  )
}

function LatestNote({ notes }) {
  const latest = notes?.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  if (!latest) return null

  return (
    <div className="mx-4 bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Latest from Coach Kurtis</p>
      <p className="text-white/75 text-sm leading-relaxed line-clamp-3">{latest.content}</p>
      <p className="text-white/25 text-xs mt-2">
        {new Date(latest.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
      </p>
    </div>
  )
}

export default function PlayerHome() {
  const { user } = useAuth()
  const { data: player, loading } = useMyPlayerProfile(user?.id)
  const navigate = useNavigate()

  const name = player?.users?.name || 'Player'
  const firstName = name.split(' ')[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Greeting */}
      <div className="px-4 pt-5">
        <p className="text-white/40 text-sm">Welcome back,</p>
        <h1 className="text-white text-2xl font-bold">{firstName}</h1>
      </div>

      {/* Player card */}
      <PlayerCard player={player} name={name} />

      {/* Quick log button */}
      <div className="px-4">
        <button onClick={() => navigate('/player/games')}
          className="w-full bg-accent text-navy-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base hover:bg-accent-dim active:scale-98 transition-all shadow-glow">
          <Gamepad2 className="w-5 h-5" />
          Log a Game
        </button>
      </div>

      {/* Homework preview */}
      <HomeworkPreview homework={player?.homework} onClick={() => navigate('/player/homework')} />

      {/* Latest coach note */}
      <LatestNote notes={player?.session_notes} />

      {/* Reports link if any sent */}
      {(player?.reports?.filter(r => r.sent_at).length || 0) > 0 && (
        <button onClick={() => navigate('/player/reports')}
          className="mx-4 w-[calc(100%-2rem)] flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
              <Star className="w-4 h-4 text-white/40" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">My Reports</p>
              <p className="text-white/30 text-xs">{player.reports.filter(r => r.sent_at).length} report{player.reports.filter(r => r.sent_at).length !== 1 ? 's' : ''} from Coach Kurtis</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
        </button>
      )}
    </div>
  )
}
