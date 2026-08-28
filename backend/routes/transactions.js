import { Router } from 'express'
import Transaction from '../models/Transaction.js'
import auth from '../middleware/auth.js'

import { buildSummary } from '../utils/summary.js'

const router = Router()

router.use(auth)

router.get('/', async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.userId }).sort({
      date: -1,
      createdAt: -1,
    })
    res.json({ transactions, summary: buildSummary(transactions) })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "income" or "expense"' })
    }
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than 0' })
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      amount: numericAmount,
      category: category || 'General',
      description: description || '',
      date: date ? new Date(date) : Date.now(),
    })

    res.status(201).json({ transaction })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    })
    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' })
    }
    res.json({ message: 'Deleted', id: req.params.id })
  } catch (err) {
    next(err)
  }
})

export default router
