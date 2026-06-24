import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMyPlayerProfile } from '../../hooks/useSupabase'
import { supabase } from '../../lib/supabase'
import {
  Plus, Star, Loader2, CheckCircle2, ChevronDown, Zap,
  Trophy, Minus, X as XIcon
} from 'lucide-react'

const RESULTS = [
  { value: 'win', label: 'Win', color: 'bg-green-500/15 border-green-500/30 text-green-400' },
  { value: 'draw', label: 'Draw', color: 'bg-white/8 border-white/15 text-white/70' },
  { value: 'loss', label: 'Loss', color: 'bg-red-500/15 border-red-500/30 text-red-400' },
]

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="p-1 transition-transform active:scale-90">
          <Star className={`w-8 h-8 transition-colors
            ${i <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`} />
        </button>
      ))}
    </div>
  )
}

function GameCard({ log }) {
  const [expanded, setExpanded] = useState(false)
  const resultColor = { win: 'text-green-400', draw: 'text-white/60', loss: 'text-red-400' }[log.result] || 'text-white/40'

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(v => !v)} className="w-full p-4 text-left flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${resultColor} border ${
            log.result === 'win' ? 'border-green-500/20 bg-green-500/10' :
            log.result === 'loss' ? 'border-red-500/20 bg-red-500/10' : 'border-white/10 bg-white/5'
          }`}>
            {log.result || '—'}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">vs {log.opponent || 'Unknown'}</p>
            <p className="text-white/30 text-xs mt-0.5">
              {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              {log.score ? ` · ${log.score}` : ''}
              {log.minutes ? ` · ${log.minutes} mins` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3.5 h-3.5 ${i <= log.self_rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
            ))}
          </div>
          <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {expanded && log.reflection_question && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-white/40 text-xs italic mb-1">"{log.reflection_question}"</p>
          <p className="text-white/70 text-sm">{log.reflection_answer || <span className="text-white/25">No answer given</span>}</p>
        </div>
      )}
    </div>
  )
}

export default function GameLog() {
  const { user } = useAuth()
  const { data: player, loading, refetch } = useMyPlayerProfile(user?.id)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    opponent: '',
    result: '',
    score: '',
    position: player?.position || '',
    minutes: '',
    self_rating: 0,
    reflection_answer: '',
  })
  const [reflectionQ, setReflectionQ] = useState('')
  const [loadingQ, setLoadingQ] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const logs = [...(player?.game_logs || [])].sort((a, b) => new Date(b.date) - new Date(a.date))

  async function fetchReflectionQuestion() {
    if (!player?.development_focus) {
      setReflectionQ('What was the most important moment in the game for you today?')
      return
    }
    setLoadingQ(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/reflection/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          developmentFocus: player.development_focus,
          opponent: form.opponent,
          result: form.result,
        }),
      })
      const data = await res.json()
      setReflectionQ(data.question)
    } catch {
      setReflectionQ(`In this match, where did you notice your focus on ${player.development_focus} making a difference?`)
    } finally {
      setLoadingQ(false)
    }
  }

  function openForm() {
    setShowForm(true)
    setDone(false)
    setReflectionQ('')
    setForm({
      date: new Date().toISOString().slice(0, 10),
      opponent: '',
      result: '',
      score: '',
      position: player?.position || '',
      minutes: '',
      self_rating: 0,
      reflection_answer: '',
    })
  }

  function handleResultSelect(result) {
    setForm(f => ({ ...f, result }))
    // Auto-fetch reflection question once result is selected and opponent is known
    if (!reflectionQ && player?.development_focus) {
      setTimeout(() => fetchReflectionQuestion(), 300)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.result || !form.self_rating) return
    setSubmitting(true)
    try {
      await supabase.from('game_logs').insert({
        player_id: player.id,
        date: form.date,
        opponent: form.opponent,
        result: form.result,
        score: form.score,
        position: form.position,
        minutes: form.minutes ? parseInt(form.minutes) : null,
        self_rating: form.self_rating,
        reflection_question: reflectionQ,
        reflection_answer: form.reflection_answer,
      })

      // Update last_active and check milestones
      await supabase.from('players').update({ last_active: new Date().toISOString() }).eq('id', player.id)

      // Award first game milestone if this is their first
      if (logs.length === 0) {
        await supabase.from('milestones').insert({
          player_id: player.id,
          badge_name: 'First Game Logged',
          badge_description: 'Submitted your first game log on Game IQ',
          awarded_by: 'system',
        })
      }

      setDone(true)
      refetch()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>

  return (
    <div className="px-4 py-5 space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">Game Log</h1>
        {!showForm && (
          <button onClick={openForm}
            className="flex items-center gap-1.5 bg-accent text-navy-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-accent-dim active:scale-95 transition-all">
            <Plus className="w-4 h-4" />Log Game
          </button>
        )}
      </div>

      {/* Log form */}
      {showForm && !done && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <p className="text-white font-semibold">New Game</p>
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-5">
            {/* Date + Opponent */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/40 text-xs mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">Opponent</label>
                <input value={form.opponent} onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
                  placeholder="Team name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent/50" />
              </div>
            </div>

            {/* Result */}
            <div>
              <label className="block text-white/40 text-xs mb-2">Result *</label>
              <div className="grid grid-cols-3 gap-2">
                {RESULTS.map(({ value, label, color }) => (
                  <button key={value} type="button" onClick={() => handleResultSelect(value)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all
                      ${form.result === value ? color : 'border-white/10 text-white/30 hover:border-white/20'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Score + Position + Minutes */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-white/40 text-xs mb-1.5">Score</label>
                <input value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                  placeholder="2-1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">Position</label>
                <input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  placeholder="ST"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">Minutes</label>
                <input type="number" value={form.minutes} onChange={e => setForm(f => ({ ...f, minutes: e.target.value }))}
                  placeholder="90"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent/50" />
              </div>
            </div>

            {/* Star rating */}
            <div>
              <label className="block text-white/40 text-xs mb-2">Your Performance *</label>
              <StarPicker value={form.self_rating} onChange={v => setForm(f => ({ ...f, self_rating: v }))} />
            </div>

            {/* Reflection question */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/40 text-xs">Reflection</label>
                {!reflectionQ && (
                  <button type="button" onClick={fetchReflectionQuestion} disabled={loadingQ}
                    className="text-xs text-accent hover:text-accent-dim flex items-center gap-1 disabled:opacity-50">
                    {loadingQ ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    Generate question
                  </button>
                )}
              </div>

              {loadingQ && (
                <div className="flex items-center gap-2 py-3 text-white/30 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  Generating your question...
                </div>
              )}

              {reflectionQ && (
                <div className="mb-2 bg-accent/5 border border-accent/15 rounded-xl px-3 py-2.5">
                  <p className="text-accent/80 text-sm italic">"{reflectionQ}"</p>
                </div>
              )}

              <textarea value={form.reflection_answer} onChange={e => setForm(f => ({ ...f, reflection_answer: e.target.value }))}
                rows={3} placeholder="Write your answer here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent/50 resize-none" />
            </div>

            <button type="submit" disabled={submitting || !form.result || !form.self_rating}
              className="w-full bg-accent text-navy-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-accent-dim active:scale-98 transition-all">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
              {submitting ? 'Saving...' : 'Save Game'}
            </button>
          </form>
        </div>
      )}

      {/* Success state */}
      {done && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">Game logged!</p>
          <p className="text-white/40 text-sm mb-4">Coach Kurtis can see your log.</p>
          <button onClick={openForm} className="text-accent text-sm font-medium hover:underline">Log another game</button>
        </div>
      )}

      {/* History */}
      {logs.length > 0 && (
        <div>
          <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Match History</p>
          <div className="space-y-2">
            {logs.map(log => <GameCard key={log.id} log={log} />)}
          </div>
        </div>
      )}

      {logs.length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-7 h-7 text-white/15" />
          </div>
          <p className="text-white/30 text-sm">No games logged yet.</p>
          <p className="text-white/20 text-xs mt-1">Tap "Log Game" after your next match.</p>
        </div>
      )}
    </div>
  )
}
