import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/reflection/question — generate a dynamic reflection question for a game log
router.post('/question', requireAuth, requireRole('player'), async (req, res) => {
  const { developmentFocus, opponent, result } = req.body
  if (!developmentFocus) {
    return res.json({ question: 'What was the most important moment in the game for you, and what did it teach you?' })
  }
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `A young football player (age 7-16) just played a match${opponent ? ` against ${opponent}` : ''}${result ? ` (${result})` : ''}. Their current development focus is: "${developmentFocus}".

Write ONE short, specific reflection question directly related to their development focus. The question must:
- Be directly about the focus area (not generic)
- Be written in simple language a young player understands
- Be encouraging in tone
- Be one sentence only
- NOT start with "How did you"

Return only the question, nothing else.`
      }]
    })
    res.json({ question: message.content[0].text.trim() })
  } catch (err) {
    res.json({ question: `In this match, where did you notice your ${developmentFocus} making a difference?` })
  }
})

export default router
