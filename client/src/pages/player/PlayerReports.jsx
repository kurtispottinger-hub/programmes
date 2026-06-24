import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMyPlayerProfile } from '../../hooks/useSupabase'
import { Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react'

function ReportCard({ report }) {
  const [expanded, setExpanded] = useState(false)
  const monthName = new Date(report.year, report.month - 1, 1)
    .toLocaleString('en-GB', { month: 'long' })

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-4 text-left">
        <div>
          <p className="text-white font-semibold text-sm">{monthName} {report.year}</p>
          <p className="text-white/30 text-xs mt-0.5">
            From Coach Kurtis ·{' '}
            {new Date(report.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-white/25" />
          : <ChevronDown className="w-4 h-4 text-white/25" />
        }
      </button>
      {expanded && (
        <div className="border-t border-white/8 px-4 pb-5 pt-4">
          <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">
            {report.final_content}
          </p>
        </div>
      )}
    </div>
  )
}

export default function PlayerReports() {
  const { user } = useAuth()
  const { data: player, loading } = useMyPlayerProfile(user?.id)

  const reports = [...(player?.reports || [])]
    .filter(r => r.sent_at)
    .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin text-accent" />
    </div>
  )

  return (
    <div className="px-4 py-5 space-y-4 pb-6">
      <div>
        <h1 className="text-white text-2xl font-bold">My Reports</h1>
        <p className="text-white/30 text-sm mt-1">Monthly development reports from Coach Kurtis.</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7 text-white/15" />
          </div>
          <p className="text-white/30 text-sm">No reports yet.</p>
          <p className="text-white/20 text-xs mt-1">Your first report will appear here after your first month.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => <ReportCard key={report.id} report={report} />)}
        </div>
      )}
    </div>
  )
}
