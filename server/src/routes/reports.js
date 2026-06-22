import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../index.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/reports/generate — AI draft for a player's monthly report
router.post('/generate', requireAuth, requireRole('coach'), async (req, res) => {
  const { playerId, month, year } = req.body
  if (!playerId || !month || !year) {
    return res.status(400).json({ error: 'playerId, month, and year are required' })
  }

  try {
    // Fetch all data needed for the report
    const [playerRes, notesRes, logsRes, homeworkRes, prevReportRes] = await Promise.all([
      supabaseAdmin.from('players').select('*, users!user_id(name)').eq('id', playerId).single(),
      supabaseAdmin.from('session_notes').select('*').eq('player_id', playerId)
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('date', getNextMonthStart(year, month)),
      supabaseAdmin.from('game_logs').select('*').eq('player_id', playerId)
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('date', getNextMonthStart(year, month)),
      supabaseAdmin.from('homework').select('*').eq('player_id', playerId)
        .gte('created_at', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('created_at', getNextMonthStart(year, month)),
      supabaseAdmin.from('reports').select('final_content').eq('player_id', playerId)
        .not('sent_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    const player = playerRes.data
    const notes = notesRes.data || []
    const logs = logsRes.data || []
    const homework = homeworkRes.data || []
    const prevReport = prevReportRes.data

    const monthName = new Date(year, month - 1, 1).toLocaleString('en-GB', { month: 'long' })
    const playerName = player.users?.name?.split(' ')[0] || 'the player'

    const dataContext = `
PLAYER: ${player.users?.name}
FIRST NAME: ${playerName}
AGE: ${player.age}
POSITION: ${player.position}
PROGRAMME TIER: ${player.programme_tier}
CURRENT DEVELOPMENT FOCUS: ${player.development_focus || 'Not set'}
REPORT MONTH: ${monthName} ${year}

SESSION NOTES (${notes.length} this month):
${notes.map(n => `[${n.date}] ${n.session_type}: ${n.content}`).join('\n') || 'No session notes this month.'}

GAME LOGS (${logs.length} this month):
${logs.map(l => `[${l.date}] vs ${l.opponent} — ${l.result} ${l.score}, ${l.minutes} mins, ${l.self_rating}/5 stars. Reflection Q: "${l.reflection_question}" A: "${l.reflection_answer}"`).join('\n') || 'No games logged this month.'}

HOMEWORK (${homework.length} tasks):
${homework.map(h => `"${h.title}" — ${h.completed ? `Completed. Note: ${h.completion_note || 'none'}` : 'Not completed'}`).join('\n') || 'No homework set this month.'}

PREVIOUS REPORT (for context):
${prevReport?.final_content || 'No previous report available.'}
`.trim()

    const systemPrompt = `You are writing a monthly development report on behalf of Coach Kurtis, a professional football development coach. You are writing directly to the player's parent. Your job is to draft a warm, direct, specific, and professional report based only on the data provided.

Rules you must follow without exception:
- Never use em dashes
- Never use the words: delve, furthermore, ultimately, sessions, fees, Academy
- Never use bullet points anywhere in the report body
- Never use generic praise. Reference specific things the player has actually done based on the data provided
- Always use the word "programme" not "sessions"
- Always use "monthly investment" not "fees"
- Write in short paragraphs. Active voice throughout
- Do not use headers inside the report body
- Write as Kurtis would speak to a parent at the end of a training session. Confident, knowledgeable, encouraging, and direct

Report structure:
1. Opening sentence referencing the month and the player's first name
2. One paragraph on what was worked on in programme work that month
3. One paragraph on game log observations and how they connect to the player's development focus
4. One paragraph on homework engagement and what it shows about the player's attitude
5. One closing paragraph setting the focus for the coming month

Return only the report text. No preamble, no explanation, no sign-off.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: dataContext }],
    })

    const draft = message.content[0].text

    // Save the draft to reports table
    const { data: report, error: saveError } = await supabaseAdmin
      .from('reports')
      .upsert({
        player_id: playerId,
        month,
        year,
        ai_draft: draft,
        final_content: draft,
      }, { onConflict: 'player_id,month,year' })
      .select()
      .single()
    if (saveError) throw saveError

    res.json({ draft, reportId: report.id })
  } catch (err) {
    console.error('Report generation error:', err)
    res.status(500).json({ error: err.message || 'Failed to generate report' })
  }
})

// PATCH /api/reports/:id — update final content and optionally send
router.patch('/:id', requireAuth, requireRole('coach'), async (req, res) => {
  const { finalContent, send } = req.body
  try {
    const updates = { final_content: finalContent }
    if (send) updates.sent_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('reports')
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

function getNextMonthStart(year, month) {
  const d = new Date(year, month, 1) // month is 1-indexed, Date uses 0-indexed so month = next month
  return d.toISOString().slice(0, 10)
}

export default router
