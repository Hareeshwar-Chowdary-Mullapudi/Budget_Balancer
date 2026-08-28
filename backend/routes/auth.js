import { Router } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import auth from '../middleware/auth.js'
import { isValidEmail, normalizeEmail } from '../utils/validate.js'

const router = Router()

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const normalized = normalizeEmail(email)
    if (await User.findOne({ email: normalized })) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const user = await User.create({ name: name.trim(), email: normalized, password })
    res.status(201).json({ token: signToken(user.id), user })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: normalizeEmail(email) })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    res.json({ token: signToken(user.id), user })
  } catch (err) {
    next(err)
  }
})

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select(
      '+resetPasswordToken +resetPasswordExpires'
    )

    const message =
      'If an account exists for that email, you can use the reset link to choose a new password.'

    if (!user) {
      return res.json({ message })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = hashResetToken(resetToken)
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()

    const payload = { message }
    if (process.env.NODE_ENV !== 'production') {
      payload.resetUrl = `/reset-password?token=${resetToken}`
    }

    res.json(payload)
  } catch (err) {
    next(err)
  }
})

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findOne({
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires')

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password updated. You can log in now.' })
  } catch (err) {
    next(err)
  }
})

export default router
