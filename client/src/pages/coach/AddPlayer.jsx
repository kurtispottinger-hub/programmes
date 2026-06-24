import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const POSITIONS = ['Goalkeeper', 'Defender', 'Centre-back', 'Full-back', 'Midfielder', 'Central Midfielder', 'Attacking Midfielder', 'Winger', 'Striker', 'Forward']

export default function AddPlayer() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    position: '',
    programmeTier: 'GIA',
    playerEmail: '',
    parentEmail: '',
    parentName: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function update(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/add-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create player')
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Player Added</h2>
        <p className="text-gray-500 text-sm mb-6">
          {form.firstName}'s account has been created. Login details have been sent to {form.parentEmail}.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSuccess(false); setForm({ firstName: '', lastName: '', age: '', position: '', programmeTier: 'GIA', playerEmail: '', parentEmail: '', parentName: '' }) }}
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
            Add Another
          </button>
          <button onClick={() => navigate('/coach')} className="px-4 py-2.5 bg-navy-900 text-white text-sm font-medium rounded-xl hover:bg-navy-800">
            Back to Roster
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/coach')} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to roster
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Player</h1>
        <p className="text-gray-400 text-sm mt-1">Creates player and parent accounts automatically. Login details sent by email.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Player details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Player Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">First Name *</label>
              <input value={form.firstName} onChange={update('firstName')} required placeholder="e.g. Marcus"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Last Name *</label>
              <input value={form.lastName} onChange={update('lastName')} required placeholder="e.g. Johnson"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Age</label>
              <input type="number" value={form.age} onChange={update('age')} placeholder="e.g. 12" min={5} max={18}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Position</label>
              <select value={form.position} onChange={update('position')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/60">
                <option value="">Select position</option>
                {POSITIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1.5">Programme Tier</label>
              <div className="flex gap-3">
                {['GIA', 'Game IQ Remote'].map(tier => (
                  <button key={tier} type="button" onClick={() => setForm(f => ({ ...f, programmeTier: tier }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                      ${form.programmeTier === tier ? 'bg-navy-900 text-white border-navy-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Login details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Login Details</h2>
          <p className="text-xs text-gray-400 mb-4">Separate accounts are created. Login credentials are emailed automatically.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Player Email (leave blank to use parent email)</label>
              <input type="email" value={form.playerEmail} onChange={update('playerEmail')} placeholder="player@example.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Parent Name *</label>
                <input value={form.parentName} onChange={update('parentName')} required placeholder="e.g. Sarah Johnson"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Parent Email *</label>
                <input type="email" value={form.parentEmail} onChange={update('parentEmail')} required placeholder="parent@example.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white font-semibold py-3.5 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
          {loading ? 'Creating accounts...' : 'Add Player'}
        </button>
      </form>
    </div>
  )
}
