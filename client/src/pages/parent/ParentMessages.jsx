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
      <div className={`max-w-[78%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isOwn
            ? 'bg-navy-900 text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'
          }`}>
          {message.content}
        </div>
        <p className="text-gray-300 text-[10px] px-1">{date} · {time}</p>
      </div>
    </div>
  )
}

export default function ParentMessages() {
  const { user } = useAuth()
  const { data: coach, loading: coachLoading } = useCoachUser()
  const { data: messages, loading: msgsLoading, refetch } = useMessages(user?.id, coach?.id)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      thread_type: 'coach-parent',
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
      <div className="px-4 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-sm">{coach?.name || 'Coach Kurtis'}</p>
            <p className="text-gray-400 text-xs">Your child's coach · Private thread</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        )}

        {!loading && (!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">No messages yet.</p>
            <p className="text-gray-300 text-xs mt-1">Ask Coach Kurtis anything below.</p>
          </div>
        )}

        {messages?.map(msg => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="px-4 pb-4 pt-3 flex-shrink-0 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Message Coach Kurtis..."
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:border-navy-900/30 bg-slate-50"
          />
          <button type="submit" disabled={!text.trim() || sending}
            className="w-11 h-11 bg-navy-900 rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-navy-800 active:scale-95 transition-all disabled:opacity-30">
            {sending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
        <p className="text-gray-300 text-[10px] text-center mt-2">
          This is a private thread — separate from your child's messages with Coach Kurtis
        </p>
      </form>
    </div>
  )
}
