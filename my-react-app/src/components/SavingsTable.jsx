import { SAVINGS_BRACKETS, getBracket } from '../utils/savings'

export default function SavingsTable({ income = 0 }) {
  const active = income > 0 ? getBracket(income) : null

  return (
    <section className="card savings-table-card">
      <div className="card-title-row">
        <span className="card-icon" aria-hidden="true">
          📊
        </span>
        <h2>Savings guide</h2>
      </div>
      <p className="muted small card-desc">
        Target savings % scales with your income bracket — not a fixed 50/30/20 rule.
      </p>
      <ul className="bracket-list">
        {SAVINGS_BRACKETS.map((b) => {
          const isActive = active && active.label === b.label
          return (
            <li key={b.label} className={`bracket-row ${isActive ? 'active' : ''}`}>
              <span className="bracket-income">{b.label}</span>
              <span className="bracket-pct">
                {b.minPct}–{b.maxPct}%
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
