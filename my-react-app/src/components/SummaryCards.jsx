import { formatMoney } from '../utils/format'

export default function SummaryCards({ summary }) {
  const { income = 0, expense = 0, savings = 0 } = summary || {}

  return (
    <div className="summary-grid">
      <div className="summary-card income">
        <span className="summary-label">Income</span>
        <span className="summary-value">{formatMoney(income)}</span>
      </div>
      <div className="summary-card expense">
        <span className="summary-label">Expense</span>
        <span className="summary-value">{formatMoney(expense)}</span>
      </div>
      <div className={`summary-card savings ${savings < 0 ? 'negative' : ''}`}>
        <span className="summary-label">Remaining Savings</span>
        <span className="summary-value">{formatMoney(savings)}</span>
      </div>
    </div>
  )
}
