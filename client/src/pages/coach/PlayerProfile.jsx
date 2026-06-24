import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../../hooks/useSupabase'
import { supabase } from '../../lib/supabase'
import {
  ArrowLeft, User, FileText, Gamepad2, BookOpen, BarChart2,
  MessageCircle, Lock, Plus, Check, X, Edit3, Save, Loader2,
  Calendar, Award, Star, ChevronDown, ChevronUp, Send
} from 'lucide-react'

const TABS = [
  { key: 'notes', icon: FileText, label: 'Notes' },
  { key: 'games', icon: Gamepad2, label: 'Games' },
  { key: 'homework', icon: BookOpen, label: 'Homework' },
  { key: 'reports', icon: BarChart2, label: 'Reports' },
  { key: 'private', icon: Lock, label: 'Private' },
]

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ResultBadge({ result }) {
  const cls = { win: 'bg-green-100 text-green-700', draw: 'bg-gray-100 text-gray-600', loss: 'bg-red-100 text-red-600' }
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${cls[result] || 'bg-gray-100 text-gray-500'}`}>{result || '—'}</span>
}

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

// ─── Session Notes Tab ────────────────────────────────────────────────────────
function NotesTab({ player, refetch }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), session_type: 'in-person', content: '' })
  const [saving, setSaving] = useState(false)

  const notes = [...(player.session_notes || [])].sort((a, b) => new Date(b.date) - new Date(a.date))

  async function save() {
    if (!form.content.trim()) return
    setSaving(true)
    await supabase.from('session_notes').insert({ player_id: player.id, ...form })
    setSaving(false)
    setForm({ date: new Date().toISOString().slice(0,10), session_type: 'in-person', content: '' })
    setOpen(false)
    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Session Notes</h3>
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dim transition-colors">
          <Plus className="w-4 h-4" />Add Note
        </button>
      </div>

      {open && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={form.session_type} onChange={e => setForm(f => ({...f, session_type: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60">
                <option value="in-person">In-person</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Note</label>
            <textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))}
              rows={4} placeholder="What did you work on? What did you observe?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60 resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-sm text-gray-400 px-3 py-2 hover:text-gray-600">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-navy-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-navy-800 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 && !open && (
        <p className="text-sm text-gray-400 py-6 text-center">No session notes yet.</p>
      )}

      <div className="space-y-3">
        {notes.map(note => (
          <div key={note.id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-500">{fmt(note.date)}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
                ${note.session_type === 'in-person' ? 'bg-navy-900/8 text-navy-900' : 'bg-accent/10 text-accent-dim'}`}>
                {note.session_type}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
            {note.coach_private_note && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Private: {note.coach_private_note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Game Logs Tab ────────────────────────────────────────────────────────────
function GamesTab({ player }) {
  const logs = [...(player.game_logs || [])].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Game Logs</h3>
      {logs.length === 0 && <p className="text-sm text-gray-400 py-6 text-center">No games logged yet.</p>}
      <div className="space-y-3">
        {logs.map(log => (
          <div key={log.id} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">vs {log.opponent || 'Unknown'}</p>
                <p className="text-xs text-gray-400">{fmt(log.date)} · {log.position || '—'} · {log.minutes || '—'} mins</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <ResultBadge result={log.result} />
                {log.score && <span className="text-xs font-bold text-gray-600">{log.score}</span>}
              </div>
            </div>
            <StarRating value={log.self_rating} />
            {log.reflection_question && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-1 italic">"{log.reflection_question}"</p>
                <p className="text-sm text-gray-700">{log.reflection_answer || <span className="text-gray-300">No answer</span>}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Homework Tab ─────────────────────────────────────────────────────────────
function HomeworkTab({ player, refetch }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', video_url: '', due_date: '' })
  const [saving, setSaving] = useState(false)

  const tasks = [...(player.homework || [])].sort((a, b) => a.completed - b.completed || new Date(b.created_at) - new Date(a.created_at))

  async function save() {
    if (!form.title.trim()) return
    setSaving(true)
    await supabase.from('homework').insert({ player_id: player.id, ...form })
    setSaving(false)
    setForm({ title: '', description: '', video_url: '', due_date: '' })
    setOpen(false)
    refetch()
  }

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Homework</h3>
          {tasks.length > 0 && <p className="text-xs text-gray-400 mt-0.5">{completionRate}% completion rate</p>}
        </div>
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dim">
          <Plus className="w-4 h-4" />Set Task
        </button>
      </div>

      {open && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
            placeholder="Task title" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60" />
          <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
            rows={3} placeholder="Description (optional)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.video_url} onChange={e => setForm(f => ({...f, video_url: e.target.value}))}
              placeholder="Video URL (optional)" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60" />
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-sm text-gray-400 px-3 py-2">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-navy-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-navy-800 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save
            </button>
          </div>
        </div>
      )}

      {tasks.length === 0 && !open && <p className="text-sm text-gray-400 py-6 text-center">No homework set yet.</p>}

      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className={`border rounded-2xl p-4 ${task.completed ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                ${task.completed ? 'border-green-400 bg-green-400' : 'border-gray-200'}`}>
                {task.completed && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>{task.title}</p>
                {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                {task.due_date && <p className="text-xs text-gray-400 mt-1">Due: {fmt(task.due_date)}</p>}
                {task.completed && task.completion_note && (
                  <p className="text-xs text-green-600 mt-1 italic">Player: "{task.completion_note}"</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────
function ReportsTab({ player, refetch }) {
  const [generating, setGenerating] = useState(false)
  const [draft, setDraft] = useState(null)
  const [editedDraft, setEditedDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [reportId, setReportId] = useState(null)
  const [month] = useState(new Date().getMonth() + 1)
  const [year] = useState(new Date().getFullYear())

  const sentReports = [...(player.reports || [])].filter(r => r.sent_at).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
  const monthName = new Date(year, month - 1, 1).toLocaleString('en-GB', { month: 'long' })

  async function generateReport() {
    setGenerating(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, month, year }),
      })
      const data = await res.json()
      setDraft(data.draft)
      setEditedDraft(data.draft)
      setReportId(data.reportId)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  async function sendReport() {
    if (!reportId) return
    setSending(true)
    await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalContent: editedDraft, send: true }),
    })
    setSending(false)
    setDraft(null)
    setEditedDraft('')
    setReportId(null)
    refetch()
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Monthly Reports</h3>

      {/* Draft builder */}
      {!draft ? (
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-5 text-center">
          <p className="text-white font-semibold mb-1">{monthName} {year} Report</p>
          <p className="text-white/50 text-sm mb-4">Generate an AI draft using this month's session notes, game logs, and homework.</p>
          <button onClick={generateReport} disabled={generating}
            className="flex items-center gap-2 bg-accent text-navy-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent-dim transition-colors mx-auto disabled:opacity-50">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
            {generating ? 'Generating...' : 'Generate Report Draft'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">AI Draft — {monthName} {year}</p>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Review before sending</span>
          </div>
          <textarea
            value={editedDraft}
            onChange={e => setEditedDraft(e.target.value)}
            rows={12}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 leading-relaxed focus:outline-none focus:border-accent/60 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setDraft(null); setEditedDraft('') }} className="text-sm text-gray-400 px-3 py-2 hover:text-gray-600">Discard</button>
            <button onClick={sendReport} disabled={sending}
              className="flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Approve & Send
            </button>
          </div>
        </div>
      )}

      {/* Sent reports history */}
      {sentReports.length > 0 && (
        <div className="space-y-2 mt-2">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Sent Reports</p>
          {sentReports.map(report => (
            <SentReport key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}

function SentReport({ report }) {
  const [expanded, setExpanded] = useState(false)
  const monthName = new Date(report.year, report.month - 1, 1).toLocaleString('en-GB', { month: 'long' })
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center justify-between p-4 text-left">
        <div>
          <p className="font-medium text-sm text-gray-900">{monthName} {report.year}</p>
          <p className="text-xs text-gray-400">Sent {fmt(report.sent_at)}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pt-3">{report.final_content}</p>
        </div>
      )}
    </div>
  )
}

// ─── Private Notes Tab ────────────────────────────────────────────────────────
function PrivateTab({ player, refetch }) {
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState(player.development_focus || '')
  const [privateNote, setPrivateNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function saveDevFocus() {
    setSaving(true)
    await supabase.from('players').update({ development_focus: note }).eq('id', player.id)
    setSaving(false)
    setEditing(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Development focus */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Development Focus</h3>
          <button onClick={() => setEditing(v => !v)} className="flex items-center gap-1 text-sm text-accent hover:text-accent-dim">
            <Edit3 className="w-3.5 h-3.5" />{editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {editing ? (
          <div className="space-y-2">
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="What is this player currently working on? This feeds into game log questions and AI reports."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-accent/60 resize-none" />
            <div className="flex justify-end">
              <button onClick={saveDevFocus} disabled={saving}
                className="flex items-center gap-1.5 bg-navy-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-navy-800 disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-accent/5 border border-accent/15 rounded-2xl p-4">
            <p className="text-sm text-gray-700">{player.development_focus || <span className="text-gray-400 italic">Not set yet. Add a focus area to power the game log reflection questions and AI reports.</span>}</p>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Milestones</h3>
        {(player.milestones || []).length === 0 ? (
          <p className="text-sm text-gray-400">No milestones awarded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {player.milestones.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">{m.badge_name}</p>
                  <p className="text-xs text-amber-600">{fmt(m.awarded_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Award custom milestone */}
      <AwardMilestone playerId={player.id} refetch={refetch} />
    </div>
  )
}

function AwardMilestone({ playerId, refetch }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ badge_name: '', badge_description: '' })
  const [saving, setSaving] = useState(false)

  async function award() {
    if (!form.badge_name.trim()) return
    setSaving(true)
    await supabase.from('milestones').insert({ player_id: playerId, ...form, awarded_by: 'coach' })
    setSaving(false)
    setForm({ badge_name: '', badge_description: '' })
    setOpen(false)
    refetch()
  }

  return (
    <div>
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dim">
        <Plus className="w-4 h-4" />Award Custom Milestone
      </button>
      {open && (
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <input value={form.badge_name} onChange={e => setForm(f => ({...f, badge_name: e.target.value}))}
            placeholder="Badge name" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60" />
          <input value={form.badge_description} onChange={e => setForm(f => ({...f, badge_description: e.target.value}))}
            placeholder="Description (optional)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent/60" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-sm text-gray-400 px-3 py-2">Cancel</button>
            <button onClick={award} disabled={saving} className="flex items-center gap-1.5 bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber-600 disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}Award
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Player Profile ──────────────────────────────────────────────────────
export default function PlayerProfile() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const { data: player, loading, error, refetch } = usePlayer(playerId)
  const [tab, setTab] = useState('notes')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading player...</span>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-sm mb-3">Player not found.</p>
        <button onClick={() => navigate('/coach')} className="text-accent text-sm hover:underline">← Back to roster</button>
      </div>
    )
  }

  const name = player.users?.name || 'Unknown Player'
  const daysAgo = player.last_active
    ? Math.floor((Date.now() - new Date(player.last_active)) / 86400000)
    : null

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/coach')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to roster
      </button>

      {/* Player header card */}
      <div className="bg-navy-900 rounded-3xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800/50 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold text-2xl">{name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{name}</h1>
              <p className="text-white/50 text-sm mt-0.5">
                {player.position || 'No position'} · Age {player.age || '—'} · {player.programme_tier || 'GIA'}
              </p>
              <p className="text-white/30 text-xs mt-1">
                {daysAgo === 0 ? 'Active today' : daysAgo === 1 ? 'Last seen yesterday' : daysAgo ? `Last seen ${daysAgo}d ago` : 'Never logged in'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">{player.streak_count || 0}</div>
              <div className="text-white/30 text-xs">week streak</div>
            </div>
          </div>

          {player.development_focus && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Current Focus</p>
              <p className="text-white/80 text-sm">{player.development_focus}</p>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Games', value: player.game_logs?.length || 0 },
              { label: 'HW Done', value: player.homework?.filter(h => h.completed).length || 0 },
              { label: 'Reports', value: player.reports?.filter(r => r.sent_at).length || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-white/30 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all
              ${tab === key ? 'bg-navy-900 text-white' : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        {tab === 'notes' && <NotesTab player={player} refetch={refetch} />}
        {tab === 'games' && <GamesTab player={player} />}
        {tab === 'homework' && <HomeworkTab player={player} refetch={refetch} />}
        {tab === 'reports' && <ReportsTab player={player} refetch={refetch} />}
        {tab === 'private' && <PrivateTab player={player} refetch={refetch} />}
      </div>
    </div>
  )
}
