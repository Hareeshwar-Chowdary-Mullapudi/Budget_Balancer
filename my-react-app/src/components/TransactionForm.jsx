import { useState } from 'react'
import api from '../api'

const today = () => new Date().toISOString().slice(0, 10)

export default function TransactionForm({ onAdded }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/transactions', {
        type,
        amount: Number(amount),
        category: category.trim() || 'General',
        description: description.trim(),
        date,
      })
      setAmount('')
      setCategory('')
      setDescription('')
      setDate(today())
      onAdded?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add transaction')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card tx-form" onSubmit={handleSubmit}>
      <h2>Add transaction</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="type-toggle">
        <button
          type="button"
          className={`type-btn ${type === 'income' ? 'active income' : ''}`}
          onClick={() => setType('income')}
        >
          Income
        </button>
        <button
          type="button"
          className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
          onClick={() => setType('expense')}
        >
          Expense
        </button>
      </div>

      <div className="form-row">
        <label>
          Amount
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label>
        Category
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Salary, Groceries, Rent"
        />
      </label>

      <label>
        Description
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional note"
        />
      </label>

      <button className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add transaction'}
      </button>
    </form>
  )
}
