import { Router } from 'express'
import { supabaseAdmin } from '../index.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/players — coach: all players; player: own record; parent: child record
router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'coach') {
      const { data, error } = await supabaseAdmin
        .from('players')
        .select('*, users!user_id(name, email)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return res.json(data)
    }

    if (req.user.role === 'player') {
      const { data, error } = await supabaseAdmin
        .from('players')
        .select('*')
        .eq('user_id', req.user.id)
        .single()
      if (error) throw error
      return res.json(data)
    }

    if (req.user.role === 'parent') {
      const { data, error } = await supabaseAdmin
        .from('players')
        .select('*, users!user_id(name)')
        .eq('parent_id', req.user.id)
        .single()
      if (error) throw error
      return res.json(data)
    }

    res.status(403).json({ error: 'Forbidden' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/players/:id — full player detail (coach only)
router.get('/:id', requireAuth, requireRole('coach'), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
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
      .eq('id', req.params.id)
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/players/:id — update player fields (coach)
router.patch('/:id', requireAuth, requireRole('coach'), async (req, res) => {
  const allowed = ['development_focus', 'position', 'age', 'programme_tier']
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  )
  try {
    const { data, error } = await supabaseAdmin
      .from('players')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
