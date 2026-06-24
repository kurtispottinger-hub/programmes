import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMyChildProfile } from '../../hooks/useSupabase'
import {
  Loader2, BookOpen, Gamepad2, FileText, Star,
  ChevronDown, ChevronUp, Check, Trophy
} from 'lucide-react'

function SectionHeader({ children }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-5 pb-2">{children}</h2>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm mx-4 ${className}`}>
      {children}
    </div>
  )
}

function ProgressBar({ value, color = 'bg-navy-800' }) {
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function ReportRow({ report }) {
  const [expanded, setExpanded] = useState(false)
  const monthName = new Date(report.year, report.month - 1, 1)
    .toLocaleString('en-GB', { month: 'long' })

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-slate-50 transition-colors">
        <div>
          <p className="text-gray-900 font-semibold text-sm">{monthName} {report.year}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {new Date(report.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-gray-300" />
          : <ChevronDown className="w-4 h-4 text-gray-300" />
        }
      </button>
      {expanded && (
        <div className="px-4 pb-5 border-t border-gray-50 pt-4">
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{report.final_content}</p>
        </div>
      )}
    </div>
  )
}

function GameRow({ log }) {
  const resultBg = { win: 'bg-green-100 text-green-700', draw: 'bg-gray-100 text-gray-600', loss: 'bg-red-100 text-red-600' }
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg flex-shrink-0 ${resultBg[log.result] || 'bg-gray-100 text-gray-500'}`}>
        {log.result || '—'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-sm font-medium truncate">vs {log.opponent || 'Unknown'}</p>
        <p className="text-gray-400 text-xs">
          {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          {log.score ? ` · ${log.score}` : ''}
          {log.minutes ? ` · ${log.minutes}min` : ''}
        </p>
      </div>
      <div className="flex gap-0.5 flex-shrink-0">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3 h-3 ${i <= log.self_rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
        ))}
      </div>
    </div>
  )
}

export default function ParentProgress() {
  const { user } = useAuth()
  const { data: child, loading } = useMyChildProfile(user?.id)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
    </div>
  )

  const childFirst = child?.users?.name?.split(' ')[0] || 'your child'
  const sentReports = [...(child?.reports || [])].filter(r => r.sent_at).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
  const sessions = [...(child?.session_notes || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const games = [...(child?.game_logs || [])].sort((a, b) => new Date(b.date) - new Date(a.date))

  const hwTotal = child?.homework?.length || 0
  const hwDone = child?.homework?.filter(h => h.completed).length || 0
  const hwRate = hwTotal > 0 ? Math.round((hwDone / hwTotal) * 100) : 0

  const wins = games.filter(g => g.result === 'win').length
  const avgRating = games.length > 0
    ? (games.reduce((s, g) => s + (g.self_rating || 0), 0) / games.length).toFixed(1)
    : '—'

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 pb-2">
        <h1 className="text-gray-900 text-2xl font-bold">{childFirst}'s Progress</h1>
        <p className="text-gray-400 text-sm mt-0.5">Full development record</p>
      </div>

      {/* Homework section */}
      <SectionHeader>Homework</SectionHeader>
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 font-semibold text-sm">Completion Rate</span>
          </div>
          <span className="text-gray-900 font-bold text-lg">{hwRate}%</span>
        </div>
        <ProgressBar value={hwRate} color="bg-green-500" />
        <div className="flex justify-between text-xs text-gray-400 pt-1">
          <span>{hwDone} completed</span>
          <span>{hwTotal - hwDone} outstanding</span>
        </div>

        {hwTotal > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
            {child.homework.sort((a, b) => a.completed - b.completed || new Date(b.created_at) - new Date(a.created_at)).slice(0, 5).map(hw => (
              <div key={hw.id} className="flex items-start gap-2">
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center
                  ${hw.completed ? 'bg-green-400 border-green-400' : 'border-gray-200'}`}>
                  {hw.completed && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <p className={`text-xs ${hw.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{hw.title}</p>
              </div>
            ))}
            {hwTotal > 5 && <p className="text-xs text-gray-300 pl-6">{hwTotal - 5} more tasks</p>}
          </div>
        )}
      </Card>

      {/* Game performance */}
      <SectionHeader>Game Performance</SectionHeader>
      <Card>
        <div className="grid grid-cols-3 divide-x divide-gray-50">
          {[
            { label: 'Games', value: games.length },
            { label: 'Wins', value: wins },
            { label: 'Avg rating', value: avgRating },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 text-center">
              <p className="text-gray-900 font-bold text-xl">{value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {games.length > 0 && (
          <div className="border-t border-gray-50">
            {games.slice(0, 6).map(log => <GameRow key={log.id} log={log} />)}
            {games.length > 6 && (
              <p className="text-center text-xs text-gray-300 py-3">{games.length - 6} more games</p>
            )}
          </div>
        )}
        {games.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6 border-t border-gray-50">No games logged yet.</p>
        )}
      </Card>

      {/* Session history */}
      <SectionHeader>Session History</SectionHeader>
      <Card>
        {sessions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No sessions logged yet.</p>
        ) : (
          sessions.slice(0, 8).map(s => (
            <div key={s.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-navy-900/20 flex-shrink-0 mt-2" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-gray-500 text-xs font-medium">
                    {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                    ${s.session_type === 'in-person' ? 'bg-navy-900/8 text-navy-800' : 'bg-accent/10 text-accent-dim'}`}>
                    {s.session_type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{s.content}</p>
              </div>
            </div>
          ))
        )}
        {sessions.length > 8 && (
          <p className="text-center text-xs text-gray-300 py-3 border-t border-gray-50">{sessions.length - 8} earlier sessions</p>
        )}
      </Card>

      {/* Monthly reports */}
      <SectionHeader>Monthly Reports</SectionHeader>
      <Card>
        {sentReports.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No reports sent yet.</p>
        ) : (
          sentReports.map(r => <ReportRow key={r.id} report={r} />)
        )}
      </Card>

      {/* Milestones */}
      {(child?.milestones?.length || 0) > 0 && (
        <>
          <SectionHeader>Milestones</SectionHeader>
          <div className="grid grid-cols-2 gap-3 px-4">
            {child.milestones.map(m => (
              <div key={m.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-start gap-2">
                <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-semibold text-xs">{m.badge_name}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">
                    {new Date(m.awarded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
