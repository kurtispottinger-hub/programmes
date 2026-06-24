import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../../hooks/useSupabase'
import {
  Users, AlertCircle, Clock, CheckCircle2, ChevronRight,
  Flame, BookOpen, MessageCircle, Plus, RefreshCw
} from 'lucide-react'

function playerStatus(lastActive) {
  if (!lastActive) return 'red'
  const days = Math.floor((Date.now() - new Date(lastActive)) / 86400000)
  if (days <= 7) return 'green'
  if (days <= 14) return 'amber'
  return 'red'
}

function statusLabel(status) {
  return { green: 'Active', amber: 'Quiet', red: 'Inactive' }[status]
}

function StatusDot({ status }) {
  const cls = {
    green: 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]',
    amber: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]',
    red: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  }[status]
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${cls}`} />
}

function PlayerRow({ player, onClick }) {
  const status = playerStatus(player.last_active)
  const name = player.users?.name || 'Unknown'
  const initial = name[0]
  const daysAgo = player.last_active
    ? Math.floor((Date.now() - new Date(player.last_active)) / 86400000)
    : null

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-left group"
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">{initial}</span>
        </div>
        <StatusDot status={status} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
            ${player.programme_tier === 'GIA' ? 'bg-navy-900 text-white' : 'bg-accent/10 text-accent-dim'}`}>
            {player.programme_tier || 'GIA'}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {player.position || 'No position'} · Age {player.age || '—'} ·{' '}
          {daysAgo === 0 ? 'Active today' : daysAgo === 1 ? 'Yesterday' : daysAgo !== null ? `${daysAgo}d ago` : 'Never logged in'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className={`text-xs font-medium ${
            status === 'green' ? 'text-green-600' : status === 'amber' ? 'text-amber-500' : 'text-red-500'
          }`}>{statusLabel(status)}</p>
          <p className="text-xs text-gray-400">Streak: {player.streak_count || 0}w</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
      </div>
    </button>
  )
}

function StatCard({ icon: Icon, label, value, color = 'text-navy-900' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export default function CoachHome({ onViewPlayer }) {
  const { data: players, loading, error, refetch } = usePlayers()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const counts = {
    all: players?.length || 0,
    green: players?.filter(p => playerStatus(p.last_active) === 'green').length || 0,
    amber: players?.filter(p => playerStatus(p.last_active) === 'amber').length || 0,
    red: players?.filter(p => playerStatus(p.last_active) === 'red').length || 0,
  }

  const filtered = players?.filter(p => filter === 'all' || playerStatus(p.last_active) === filter) || []

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Player Roster</h1>
          <p className="text-gray-400 text-sm mt-0.5">{counts.all} players · {counts.red} need attention</p>
        </div>
        <button
          onClick={() => navigate('/coach/add-player')}
          className="flex items-center gap-2 bg-navy-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-navy-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Player
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Users} label="Total Players" value={counts.all} />
        <StatCard icon={CheckCircle2} label="Active" value={counts.green} color="text-green-500" />
        <StatCard icon={Clock} label="Going Quiet" value={counts.amber} color="text-amber-500" />
        <StatCard icon={AlertCircle} label="Inactive" value={counts.red} color="text-red-500" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'green', label: 'Active' },
          { key: 'amber', label: 'Quiet' },
          { key: 'red', label: 'Inactive' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${filter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label} {counts[key] > 0 && <span className="ml-1 opacity-60">{counts[key]}</span>}
          </button>
        ))}
      </div>

      {/* Player list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading players...</span>
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={refetch} className="text-xs text-gray-400 hover:text-gray-600 underline">Try again</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              {filter === 'all' ? 'No players yet' : `No ${filter === 'green' ? 'active' : filter === 'amber' ? 'quiet' : 'inactive'} players`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/coach/add-player')}
                className="mt-3 text-xs text-accent hover:underline"
              >
                Add your first player →
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.map(player => (
          <PlayerRow
            key={player.id}
            player={player}
            onClick={() => onViewPlayer(player.id)}
          />
        ))}
      </div>

      {/* Attention needed */}
      {counts.red > 0 && !loading && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">{counts.red} player{counts.red > 1 ? 's' : ''} haven't logged in for over 14 days</p>
              <p className="text-xs text-red-500 mt-0.5">Reach out before they disengage. Tap a player to send a message.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
