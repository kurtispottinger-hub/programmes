import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useQuery(queryFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await queryFn()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { run() }, [run])

  return { data, loading, error, refetch: run }
}

export function usePlayers() {
  return useQuery(async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*, users!user_id(name, email)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  })
}

export function usePlayer(playerId) {
  return useQuery(async () => {
    if (!playerId) return null
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        users!user_id(name, email),
        session_notes(*),
        game_logs(*),
        homework(*),
        reports(*),
        milestones(*)
      `)
      .eq('id', playerId)
      .single()
    if (error) throw error
    return data
  }, [playerId])
}

// Fetches the player record for the currently logged-in player user
export function useMyPlayerProfile(userId) {
  return useQuery(async () => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        users!user_id(name, email),
        session_notes(id, date, session_type, content, created_at),
        game_logs(*),
        homework(*),
        reports(id, month, year, final_content, sent_at),
        milestones(*)
      `)
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data
  }, [userId])
}

// Fetch the coach user record (for messaging — there's only one coach)
export function useCoachUser() {
  return useQuery(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'coach')
      .single()
    if (error) throw error
    return data
  })
}

export function useMessages(userId, otherUserId) {
  return useQuery(async () => {
    if (!userId || !otherUserId) return []
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(name, role)')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  }, [userId, otherUserId])
}
