import { Link } from 'react-router-dom'
import useTransactions from '../hooks/useTransactions'
import TransactionList from '../components/TransactionList'

const RECENT_LIMIT = 10

export default function TransactionHistory() {
  const { transactions, summary, loading } = useTransactions()
  const recent = transactions.slice(0, RECENT_LIMIT)
  const hasMore = transactions.length > RECENT_LIMIT

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">History</p>
        <h1>Transaction history</h1>
        <p className="muted page-sub">
          Your {RECENT_LIMIT} most recent entries — read only.
        </p>
      </header>

      <section className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <TransactionList transactions={recent} />
            {hasMore && (
              <div className="history-more">
                <Link to="/transactions" className="btn btn-ghost">
                  View all {summary.count} transactions →
                </Link>
              </div>
            )}
            {!recent.length && (
              <p className="muted small history-more">
                <Link to="/dashboard">Add your first transaction on the dashboard</Link>
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
