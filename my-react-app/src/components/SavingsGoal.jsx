import { formatMoney } from '../utils/format'
import { getSavingsRecommendation, STATUS_META } from '../utils/savings'

export default function SavingsGoal({ summary }) {
  const months = summary?.months || 0
  const monthlyIncome = summary?.monthlyIncome || 0
  const monthlySavings = summary?.monthlySavings || 0

  if (monthlyIncome <= 0) {
    return (
      <section className="card savings-goal">
        <div className="card-title-row">
          <span className="card-icon" aria-hidden="true">
            🎯
          </span>
          <h2>Savings goal</h2>
        </div>
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">
            💡
          </span>
          <p className="empty-state-title">No income data yet</p>
          <p className="muted small">
            Add an income transaction below to unlock your personalised savings target.
          </p>
        </div>
      </section>
    )
  }

  const { recMin, recMax, minPct, maxPct, status, progress } = getSavingsRecommendation(
    monthlyIncome,
    monthlySavings
  )
  const meta = STATUS_META[status]

  return (
    <section className="card savings-goal">
      <div className="card-head">
        <div className="card-title-row">
          <span className="card-icon" aria-hidden="true">
            🎯
          </span>
          <h2>Savings goal</h2>
        </div>
        <span className={`status-badge ${meta.className}`}>
          {meta.icon} {meta.label}
        </span>
      </div>

      <p className="muted small">
        Averaged over {months} month{months === 1 ? '' : 's'} of activity.
      </p>

      <div className="goal-rows">
        <div className="goal-row">
          <span>Avg monthly income</span>
          <strong>{formatMoney(monthlyIncome)}</strong>
        </div>
        <div className="goal-row">
          <span>Avg monthly savings</span>
          <strong>{formatMoney(monthlySavings)}</strong>
        </div>
        <div className="goal-row">
          <span>Recommended savings</span>
          <strong>
            {formatMoney(recMin)} – {formatMoney(recMax)}
            <span className="muted small"> ({minPct}–{maxPct}%)</span>
          </strong>
        </div>
      </div>

      <div className="goal-progress">
        <div className="goal-progress-track">
          <div
            className={`goal-progress-fill ${meta.className}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="muted small">
          {Math.round(progress)}% of your recommended target
        </span>
      </div>
    </section>
  )
}
