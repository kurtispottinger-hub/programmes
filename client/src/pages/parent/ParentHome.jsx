import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMyChildProfile } from '../../hooks/useSupabase'
import {
  Flame, Target, Calendar, TrendingUp, MessageCircle,
  ChevronRight, Loader2, Award, BookOpen, Gamepad2, FileText
} from 'lucide-react'

function daysAgo(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

function streakStatus(count) {
  if (count >= 5) return { label: 'On fire', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' }
  if (count >= 3) return { label: 'Building momentum', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' }
  if (count >= 1) return { label: 'Getting started', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' }
  return { label: 'Not started', color: 'text-gray-400', bg: 'bg-gray-50 border-gray-100' }
}

function ActivityItem({ icon: Icon, label, detail, date, color = 'text-navy-800' }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-sm font-medium">{label}</p>
        {detail && <p className="text-gray-400 text-xs mt-0.5 truncate">{detail}</p>}
      </div>
      {date && <p className="text-gray-300 text-xs flex-shrink-0 mt-0.5">{date}</p>}
    </div>
  )
}

function nextReportDate() {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ParentHome() {
  const { user, profile } = useAuth()
  const { data: child, loading } = useMyChildProfile(user?.id)
  const navigate = useNavigate()

  const parentFirstName = profile?.name?.split(' ')[0] || 'Parent'
  const childName = child?.users?.name || 'your child'
  const childFirst = childName.split(' ')[0]

  // Build recent activity feed
  const activities = []

  const latestNote = [...(child?.session_notes || [])].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  if (latestNote) {
    const d = daysAgo(latestNote.date)
    activities.push({
      icon: FileText,
      label: `Session note from Coach Kurtis`,
      detail: latestNote.content?.slice(0, 60) + (latestNote.content?.length > 60 ? '...' : ''),
      date: d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago`,
      color: 'text-navy-700',
    })
  }

  const latestGame = [...(child?.game_logs || [])].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  if (latestGame) {
    const d = daysAgo(latestGame.date)
    activities.push({
      icon: Gamepad2,
      label: `Game logged vs ${latestGame.opponent || 'opponent'}`,
      detail: `${latestGame.result || '—'}${latestGame.score ? ` · ${latestGame.score}` : ''} · ${latestGame.self_rating}/5 stars`,
      date: d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago`,
      color: 'text-indigo-600',
    })
  }

  const latestHW = [...(child?.homework || [])].filter(h => h.completed).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  if (latestHW) {
    const d = daysAgo(latestHW.created_at)
    activities.push({
      icon: BookOpen,
      label: `Homework completed`,
      detail: latestHW.title,
      date: d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago`,
      color: 'text-green-600',
    })
  }

  const streak = child?.streak_count || 0
  const status = streakStatus(streak)
  const hwTotal = child?.homework?.length || 0
  const hwDone = child?.homework?.filter(h => h.completed).length || 0
  const hwRate = hwTotal > 0 ? Math.round((hwDone / hwTotal) * 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
    </div>
  )

  return (
    <div className="px-4 py-5 space-y-4 pb-6">
      {/* Greeting */}
      <div>
        <p className="text-gray-400 text-sm">Good to see you,</p>
        <h1 className="text-gray-900 text-2xl font-bold">{parentFirstName}</h1>
      </div>

      {/* Child focus card */}
      <div className="bg-navy-900 rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 80% 20%, #00d4ff 0%, transparent 60%)' }} />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">{child?.programme_tier || 'GIA'} Programme</p>
              <h2 className="text-white text-xl font-bold mt-0.5">{childFirst}</h2>
              <p className="text-white/40 text-sm">{child?.position || 'Player'}{child?.age ? ` · Age ${child.age}` : ''}</p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${status.bg}`}>
              <Flame className={`w-3.5 h-3.5 ${status.color}`} />
              <span className={`text-xs font-semibold ${status.color}`}>{streak}w streak</span>
            </div>
          </div>

          {child?.development_focus ? (
            <div className="bg-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="w-3.5 h-3.5 text-accent/70" />
                <p className="text-accent/60 text-[10px] uppercase tracking-wider font-medium">Current Focus</p>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{child.development_focus}</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-white/30 text-sm italic">Coach Kurtis will set {childFirst}'s focus area soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Games', value: child?.game_logs?.length || 0 },
          { label: 'HW rate', value: `${hwRate}%` },
          { label: 'Reports', value: child?.reports?.filter(r => r.sent_at).length || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-gray-900 text-xl font-bold">{value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-gray-900 font-semibold text-sm">Recent Activity</h3>
        </div>
        <div className="px-4">
          {activities.length > 0
            ? activities.map((a, i) => <ActivityItem key={i} {...a} />)
            : <p className="text-gray-400 text-sm py-4">No activity yet.</p>
          }
        </div>
        <button onClick={() => navigate('/parent/progress')}
          className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-50 hover:bg-slate-50 transition-colors group">
          <span className="text-sm text-gray-500 font-medium">View full progress</span>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </button>
      </div>

      {/* Next report */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-gray-900 font-semibold text-sm">Next Report Due</p>
          <p className="text-gray-400 text-xs mt-0.5">{nextReportDate()}</p>
        </div>
      </div>

      {/* Messages shortcut */}
      <button onClick={() => navigate('/parent/messages')}
        className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-900/5 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-navy-800" />
          </div>
          <div className="text-left">
            <p className="text-gray-900 font-semibold text-sm">Message Coach Kurtis</p>
            <p className="text-gray-400 text-xs mt-0.5">Questions, observations, anything</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
      </button>
    </div>
  )
}
