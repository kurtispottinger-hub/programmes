import { Router } from 'express'
import { supabaseAdmin } from '../index.js'
import nodemailer from 'nodemailer'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/add-player
// Coach only — creates player + parent accounts and sends invite emails
router.post('/add-player', requireAuth, requireRole('coach'), async (req, res) => {
  const {
    firstName, lastName, age, position, programmeTier,
    playerEmail, parentEmail, parentName
  } = req.body

  if (!firstName || !lastName || !parentEmail) {
    return res.status(400).json({ error: 'firstName, lastName, and parentEmail are required' })
  }

  try {
    const playerFullName = `${firstName} ${lastName}`
    const tempPassword = generateTempPassword()
    const parentTempPassword = generateTempPassword()

    // Create player auth account
    const { data: playerAuth, error: playerAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: playerEmail || parentEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: playerFullName, role: 'player' },
    })
    if (playerAuthError) throw playerAuthError

    // Create parent auth account (only if different email)
    let parentAuth = null
    if (parentEmail && parentEmail !== playerEmail) {
      const { data, error: parentAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: parentEmail,
        password: parentTempPassword,
        email_confirm: true,
        user_metadata: { name: parentName || 'Parent', role: 'parent' },
      })
      if (parentAuthError) throw parentAuthError
      parentAuth = data
    }

    // Insert parent user record if created
    let parentUserId = null
    if (parentAuth?.user) {
      const { data: parentUser } = await supabaseAdmin
        .from('users')
        .insert({ id: parentAuth.user.id, name: parentName || 'Parent', email: parentEmail, role: 'parent' })
        .select()
        .single()
      parentUserId = parentUser?.id
    }

    // Insert player user record
    await supabaseAdmin
      .from('users')
      .insert({ id: playerAuth.user.id, name: playerFullName, email: playerEmail || parentEmail, role: 'player' })

    // Insert player record
    const { data: playerRecord, error: playerRecordError } = await supabaseAdmin
      .from('players')
      .insert({
        user_id: playerAuth.user.id,
        parent_id: parentUserId,
        age,
        position,
        programme_tier: programmeTier,
      })
      .select()
      .single()
    if (playerRecordError) throw playerRecordError

    // Send invite emails (if mailer configured)
    await sendInviteEmails({
      playerName: playerFullName,
      playerEmail: playerEmail || parentEmail,
      playerPassword: tempPassword,
      parentEmail,
      parentPassword: parentTempPassword,
      parentName: parentName || 'Parent',
    })

    res.json({ success: true, playerId: playerRecord.id })
  } catch (err) {
    console.error('Add player error:', err)
    res.status(500).json({ error: err.message || 'Failed to create player' })
  }
})

function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function sendInviteEmails({ playerName, playerEmail, playerPassword, parentEmail, parentPassword, parentName }) {
  if (!process.env.SMTP_HOST) return // Skip if SMTP not configured

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  const appUrl = process.env.APP_URL || 'https://gameiq.coachkurtis.com'

  if (playerEmail) {
    await transporter.sendMail({
      from: `"Coach Kurtis — Game IQ" <${process.env.SMTP_USER}>`,
      to: playerEmail,
      subject: `Welcome to Game IQ, ${playerName.split(' ')[0]}!`,
      html: `
        <p>Hi ${playerName.split(' ')[0]},</p>
        <p>Coach Kurtis has set up your Game IQ player account. Log in to track your development, log your games, and complete your homework.</p>
        <p><strong>Login:</strong> ${playerEmail}<br/><strong>Password:</strong> ${playerPassword}</p>
        <p><a href="${appUrl}/login">Log in to Game IQ →</a></p>
        <p>Change your password after your first login.</p>
        <p>Coach Kurtis</p>
      `,
    })
  }

  if (parentEmail && parentEmail !== playerEmail) {
    await transporter.sendMail({
      from: `"Coach Kurtis — Game IQ" <${process.env.SMTP_USER}>`,
      to: parentEmail,
      subject: `${playerName}'s Game IQ parent access`,
      html: `
        <p>Hi ${parentName},</p>
        <p>I've set up your parent access on Game IQ so you can track ${playerName}'s development, view monthly reports, and message me directly.</p>
        <p><strong>Login:</strong> ${parentEmail}<br/><strong>Password:</strong> ${parentPassword}</p>
        <p><a href="${appUrl}/login">Log in to Game IQ →</a></p>
        <p>Change your password after your first login.</p>
        <p>Coach Kurtis</p>
      `,
    })
  }
}

export default router
