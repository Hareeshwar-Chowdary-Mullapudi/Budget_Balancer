import { formatMoney } from '../utils/format'

const CARDS = [
  { key: 'income', label: 'Total income', icon: '↗', field: 'income' },
  { key: 'expense', label: 'Total expense', icon: '↘', field: 'expense' },
  { key: 'savings', label: 'Remaining savings', icon: '◎', field: 'savings' },
]

export default function SummaryCards({ summary }) {
  const { income = 0, expense = 0, savings = 0 } = summary || {}
  const values = { income, expense, savings }

  return (
    <div className="summary-grid">
      {CARDS.map(({ key, label, icon, field }) => (
        <div
          key={key}
          className={`summary-card ${key} ${field === 'savings' && savings < 0 ? 'negative' : ''}`}
        >
          <div className="summary-top">
            <span className="summary-icon" aria-hidden="true">
              {icon}
            </span>
            <span className="summary-label">{label}</span>
          </div>
          <span className="summary-value">{formatMoney(values[field])}</span>
        </div>
      ))}
    </div>
  )
}
