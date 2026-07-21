import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import auth from '../middleware/auth.js'

const router = Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function clientOrigin() {
  const raw = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  return raw.split(',')[0].trim().replace(/\/$/, '')
}

async function upsertGoogleUser(credential) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const err = new Error('Google sign-in is not configured')
    err.status = 503
    throw err
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()
  if (!payload?.email || !payload.sub) {
    const err = new Error('Invalid Google token')
    err.status = 401
    throw err
  }
  if (payload.email_verified === false) {
    const err = new Error('Google email is not verified')
    err.status = 401
    throw err
  }

  const email = payload.email.toLowerCase()
  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email }],
  })

  if (user) {
    if (!user.googleId) {
      user.googleId = payload.sub
      if (payload.picture && !user.avatar) user.avatar = payload.picture
      if (payload.name && !user.name) user.name = payload.name
      await user.save()
    }
  } else {
    user = await User.create({
      name: payload.name || email.split('@')[0],
      email,
      googleId: payload.sub,
      avatar: payload.picture,
    })
  }

  return { user, token: signToken(user.id) }
}

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const user = await User.create({ name, email, password })
    const token = signToken(user.id)
    res.status(201).json({ token, user })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await user.comparePassword(password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken(user.id)
    res.json({ token, user })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/google — JSON body (popup / SPA flow)
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' })
    }

    const { token, user } = await upsertGoogleUser(credential)
    res.json({ token, user })
  } catch (err) {
    if (err?.message?.includes('Token used too late') || err?.message?.includes('Invalid token')) {
      return res.status(401).json({ message: 'Invalid or expired Google token' })
    }
    if (err.status) {
      return res.status(err.status).json({ message: err.message })
    }
    next(err)
  }
})

// POST /api/auth/google/callback — Google redirect (form POST), then send user back to the SPA
router.post('/google/callback', async (req, res) => {
  const origin = clientOrigin()
  try {
    const credential = req.body?.credential
    if (!credential) {
      return res.redirect(`${origin}/login?error=${encodeURIComponent('Google sign-in failed')}`)
    }

    const { token } = await upsertGoogleUser(credential)
    // Hash fragment keeps the JWT out of server Referer logs
    return res.redirect(`${origin}/oauth/callback#token=${encodeURIComponent(token)}`)
  } catch (err) {
    console.error('Google callback error:', err.message)
    const message = err.message || 'Google sign-in failed'
    return res.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)
  }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

export default router
