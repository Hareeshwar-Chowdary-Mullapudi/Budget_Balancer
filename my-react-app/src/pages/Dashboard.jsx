import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useTransactions from '../hooks/useTransactions'
import SummaryCards from '../components/SummaryCards'
import AiBudgetChat from '../components/AiBudgetChat'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'

export default function Dashboard() {
  const { user } = useAuth()
  const { transactions, summary, loading, refresh } = useTransactions()

  const recent = transactions.slice(0, 5)

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Dashboard</p>
        <h1>
          Hi {user?.name}
          <span className="page-head-accent">, here's your balance</span>
        </h1>
        <p className="muted page-sub">
          This month&apos;s income, expenses, and savings — updated as you log transactions.
        </p>
      </header>

      <SummaryCards summary={summary} />

      <AiBudgetChat />

      <div className="dashboard-grid">
        <TransactionForm onAdded={refresh} />

        <section className="card">
          <div className="card-head">
            <h2>Recent transactions</h2>
            <Link to="/transaction-history" className="link">
              View history →
            </Link>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <TransactionList transactions={recent} />
          )}
        </section>
      </div>
    </div>
  )
}
