import { Link } from 'react-router-dom'
import { useState } from 'react'
import useTransactions from '../hooks/useTransactions'
import TransactionList from '../components/TransactionList'
import { filterByPeriod, monthLabel } from '../utils/transactionFilters'

export default function AllTransactions() {
  const { transactions, loading, remove } = useTransactions()
  const [period, setPeriod] = useState('month')
  const [filter, setFilter] = useState('all')

  const byPeriod = filterByPeriod(transactions, period)
  const filtered =
    filter === 'all' ? byPeriod : byPeriod.filter((t) => t.type === filter)

  const periodText =
    period === 'month' ? monthLabel() : 'All time'

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">
          <Link to="/transaction-history" className="link">
            ← Back to history
          </Link>
        </p>
        <h1>All transactions</h1>
        <p className="muted page-sub">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          {period === 'month' ? ` in ${periodText}` : ' — all time'}
        </p>
      </header>

      <section className="card">
        <div className="card-head card-head-stack">
          <h2>Full list</h2>
          <div className="filters">
            <span className="filter-group-label">Period</span>
            {[
              { id: 'month', label: 'This month' },
              { id: 'all', label: 'All time' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`chip ${period === id ? 'active' : ''}`}
                onClick={() => setPeriod(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="filters">
            <span className="filter-group-label">Type</span>
            {['all', 'income', 'expense'].map((f) => (
              <button
                key={f}
                type="button"
                className={`chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : filtered.length ? (
          <TransactionList transactions={filtered} onDelete={remove} />
        ) : (
          <p className="muted empty-inline">
            No transactions for this filter.
            {period === 'month' && (
              <>
                {' '}
                <button type="button" className="link-btn" onClick={() => setPeriod('all')}>
                  View all time
                </button>
              </>
            )}
          </p>
        )}
      </section>
    </div>
  )
}
