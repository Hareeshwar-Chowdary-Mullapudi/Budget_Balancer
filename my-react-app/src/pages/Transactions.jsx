import { useState } from 'react'
import useTransactions from '../hooks/useTransactions'
import SummaryCards from '../components/SummaryCards'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'

export default function Transactions() {
  const { transactions, summary, loading, refresh, remove } = useTransactions()
  const [filter, setFilter] = useState('all')

  const filtered =
    filter === 'all' ? transactions : transactions.filter((t) => t.type === filter)

  return (
    <div className="page">
      <header className="page-head">
        <h1>All transactions</h1>
        <p className="muted">{summary.count || 0} total entries</p>
      </header>

      <SummaryCards summary={summary} />

      <div className="dashboard-grid">
        <TransactionForm onAdded={refresh} />

        <section className="card">
          <div className="card-head">
            <h2>History</h2>
            <div className="filters">
              {['all', 'income', 'expense'].map((f) => (
                <button
                  key={f}
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
          ) : (
            <TransactionList transactions={filtered} onDelete={remove} />
          )}
        </section>
      </div>
    </div>
  )
}
