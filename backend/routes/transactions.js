import { Router } from 'express'
import Transaction from '../models/Transaction.js'
import auth from '../middleware/auth.js'

const router = Router()

// All transaction routes require authentication
router.use(auth)

function buildSummary(transactions) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const savings = income - expense

  // Count distinct calendar months (across years) that have any activity,
  // so "per month" figures are averaged over the months actually used.
  const monthKeys = new Set()
  transactions.forEach((t) => {
    const d = new Date(t.date)
    monthKeys.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}`)
  })
  const months = monthKeys.size || 1

  return {
    income,
    expense,
    savings,
    count: transactions.length,
    months,
    monthlyIncome: income / months,
    monthlyExpense: expense / months,
    monthlySavings: savings / months,
  }
}

// GET /api/transactions  -> list + summary split
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

// POST /api/transactions  -> add a transaction
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

// DELETE /api/transactions/:id
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
