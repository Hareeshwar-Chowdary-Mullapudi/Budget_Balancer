import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import auth from '../middleware/auth.js'
import { isValidEmail, normalizeEmail } from '../utils/validate.js'

const router = Router()

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
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

export default router
