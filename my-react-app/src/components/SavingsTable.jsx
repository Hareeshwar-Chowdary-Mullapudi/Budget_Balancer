import { SAVINGS_BRACKETS, getBracket } from '../utils/savings'

export default function SavingsTable({ income = 0 }) {
  const active = income > 0 ? getBracket(income) : null

  return (
    <section className="card savings-table-card">
      <h2>Recommended savings by income</h2>
      <p className="muted small">
        Instead of a fixed 50/30/20 rule, the target savings % scales with your income.
      </p>
      <table className="savings-table">
        <thead>
          <tr>
            <th>Monthly income</th>
            <th>Recommended savings</th>
          </tr>
        </thead>
        <tbody>
          {SAVINGS_BRACKETS.map((b) => (
            <tr key={b.label} className={active && active.label === b.label ? 'active-row' : ''}>
              <td>{b.label}</td>
              <td>
                {b.minPct}–{b.maxPct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
