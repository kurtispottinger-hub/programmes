import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import authRoutes from './routes/auth.js'
import playerRoutes from './routes/players.js'
import reportRoutes from './routes/reports.js'
import reflectionRoutes from './routes/reflection.js'

const app = express()
const PORT = process.env.PORT || 4000

// ─── Supabase admin client (service role — server only) ──────────────────────
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/reflection', reflectionRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Game IQ API' }))

app.listen(PORT, () => {
  console.log(`Game IQ API running on port ${PORT}`)
})
