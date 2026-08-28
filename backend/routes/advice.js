import { Router } from 'express'
import Transaction from '../models/Transaction.js'
import auth from '../middleware/auth.js'
import { buildSummary } from '../utils/summary.js'
import { chatWithAi } from '../services/aiAdvice.js'

const router = Router()

router.use(auth)

router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' })
    }

    const transactions = await Transaction.find({ user: req.userId })
    const summary = buildSummary(transactions)

    const { provider, reply } = await chatWithAi(summary, message.trim(), history)
    res.json({ provider, reply, summary })
  } catch (err) {
    console.error('AI chat error:', err.message)
    res.status(503).json({
      message: err.message || 'AI chat is unavailable. Check GROQ_API_KEY in backend .env',
    })
  }
})

export default router
