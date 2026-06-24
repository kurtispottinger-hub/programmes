import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMyPlayerProfile } from '../../hooks/useSupabase'
import { supabase } from '../../lib/supabase'
import { BookOpen, Check, Loader2, ExternalLink, CheckCircle2, X } from 'lucide-react'

function HomeworkCard({ task, onComplete }) {
  const [showReflect, setShowReflect] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date()

  async function submit() {
    setSaving(true)
    await onComplete(task.id, note)
    setSaving(false)
    setShowReflect(false)
  }

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all
      ${task.completed
        ? 'bg-green-500/5 border-green-500/15'
        : isOverdue
        ? 'bg-red-500/5 border-red-500/15'
        : 'bg-white/5 border-white/10'
      }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Completion status icon */}
          <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
            ${task.completed ? 'border-green-400 bg-green-400' : isOverdue ? 'border-red-400/50' : 'border-white/20'}`}>
            {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-white/40 text-xs mt-1 leading-relaxed">{task.description}</p>
            )}

            <div className="flex items-center gap-3 mt-2">
              {task.due_date && (
                <span className={`text-xs ${
                  task.completed ? 'text-white/20' :
                  isOverdue ? 'text-red-400' : 'text-white/30'
                }`}>
                  {isOverdue ? 'Overdue · ' : 'Due '}
                  {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {task.video_url && (
                <a href={task.video_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent-dim transition-colors">
                  <ExternalLink className="w-3 h-3" />Watch video
                </a>
              )}
            </div>

            {task.completed && task.completion_note && (
              <div className="mt-2 pt-2 border-t border-green-500/10">
                <p className="text-green-400/60 text-xs italic">Your note: "{task.completion_note}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Mark complete button */}
        {!task.completed && !showReflect && (
          <button onClick={() => setShowReflect(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 border border-accent/30 text-accent text-sm font-semibold py-2.5 rounded-xl hover:bg-accent/10 active:scale-98 transition-all">
            <Check className="w-4 h-4" />
            Mark as Complete
          </button>
        )}
      </div>

      {/* Reflection step */}
      {showReflect && (
        <div className="border-t border-white/8 p-4 space-y-3 bg-white/3">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm font-medium">One quick thought before you mark it done:</p>
            <button onClick={() => setShowReflect(false)} className="text-white/20 hover:text-white/40">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/40 text-xs italic">What did you learn or notice from this homework?</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Write something..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-accent/40 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => submit()} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-bold py-3 rounded-xl hover:bg-green-600 active:scale-98 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Complete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlayerHomework() {
  const { user } = useAuth()
  const { data: player, loading, refetch } = useMyPlayerProfile(user?.id)

  const tasks = [...(player?.homework || [])].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(a.due_date || '9999') - new Date(b.due_date || '9999')
  })
  const active = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  const completionRate = tasks.length > 0
    ? Math.round((completed.length / tasks.length) * 100) : 0

  async function markComplete(taskId, note) {
    await supabase.from('homework').update({ completed: true, completion_note: note }).eq('id', taskId)

    // Check Homework Hunter milestone (10 completed)
    const newCount = completed.length + 1
    if (newCount === 10) {
      const { data: existing } = await supabase.from('milestones')
        .select('id').eq('player_id', player.id).eq('badge_name', 'Homework Hunter').maybeSingle()
      if (!existing) {
        await supabase.from('milestones').insert({
          player_id: player.id,
          badge_name: 'Homework Hunter',
          badge_description: 'Completed 10 homework tasks on Game IQ',
          awarded_by: 'system',
        })
      }
    }
    refetch()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>

  return (
    <div className="px-4 py-5 space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">Homework</h1>
        {tasks.length > 0 && (
          <div className="text-right">
            <p className="text-accent font-bold text-lg">{completionRate}%</p>
            <p className="text-white/30 text-xs">completed</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
        </div>
      )}

      {/* Active tasks */}
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(task => (
            <HomeworkCard key={task.id} task={task} onComplete={markComplete} />
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div>
          <p className="text-white/25 text-xs uppercase tracking-wider mb-3">Completed</p>
          <div className="space-y-2">
            {completed.map(task => (
              <HomeworkCard key={task.id} task={task} onComplete={markComplete} />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-14">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7 text-white/15" />
          </div>
          <p className="text-white/30 text-sm">No homework set yet.</p>
          <p className="text-white/20 text-xs mt-1">Coach Kurtis will set tasks here.</p>
        </div>
      )}
    </div>
  )
}
