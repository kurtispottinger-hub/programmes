import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCoachUser, useMessages } from '../../hooks/useSupabase'
import { supabase } from '../../lib/supabase'
import { Send, Loader2, MessageCircle } from 'lucide-react'

function MessageBubble({ message, isOwn }) {
  const time = new Date(message.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(message.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isOwn
            ? 'bg-accent text-navy-900 font-medium rounded-tr-sm'
            : 'bg-white/10 text-white/85 rounded-tl-sm'
          }`}>
          {message.content}
        </div>
        <p className="text-white/20 text-[10px] px-1">{date} · {time}</p>
      </div>
    </div>
  )
}

export default function PlayerMessages() {
  const { user } = useAuth()
  const { data: coach, loading: coachLoading } = useCoachUser()
  const { data: messages, loading: msgsLoading, refetch } = useMessages(user?.id, coach?.id)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark unread messages as read
  useEffect(() => {
    if (!messages || !user) return
    const unread = messages.filter(m => !m.read && m.sender_id !== user.id).map(m => m.id)
    if (unread.length > 0) {
      supabase.from('messages').update({ read: true }).in('id', unread).then(() => {})
    }
  }, [messages, user])

  async function send(e) {
    e.preventDefault()
    if (!text.trim() || !coach) return
    setSending(true)
    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: coach.id,
      thread_type: 'coach-player',
      content: text.trim(),
    })
    setText('')
    setSending(false)
    refetch()
  }

  const loading = coachLoading || msgsLoading

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent font-bold text-sm">K</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{coach?.name || 'Coach Kurtis'}</p>
            <p className="text-white/30 text-xs">Your coach</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          </div>
        )}

        {!loading && (!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-white/15" />
            </div>
            <p className="text-white/30 text-sm">No messages yet.</p>
            <p className="text-white/20 text-xs mt-1">Send Coach Kurtis a message below.</p>
          </div>
        )}

        {messages?.map(msg => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-white/8">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Message Coach Kurtis..."
            className="flex-1 bg-white/8 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent/40"
          />
          <button type="submit" disabled={!text.trim() || sending}
            className="w-11 h-11 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-accent-dim active:scale-95 transition-all disabled:opacity-40">
            {sending ? <Loader2 className="w-4 h-4 animate-spin text-navy-900" /> : <Send className="w-4 h-4 text-navy-900" />}
          </button>
        </div>
      </form>
    </div>
  )
}
