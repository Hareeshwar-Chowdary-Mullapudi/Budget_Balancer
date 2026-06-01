import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useTransactions from '../hooks/useTransactions'
import SummaryCards from '../components/SummaryCards'
import SavingsGoal from '../components/SavingsGoal'
import SavingsTable from '../components/SavingsTable'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'

export default function Dashboard() {
  const { user } = useAuth()
  const { transactions, summary, loading, refresh } = useTransactions()

  const recent = transactions.slice(0, 5)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Hi {user?.name}, here's your balance</h1>
        <p className="muted">Every transaction is split into income, expense and savings.</p>
      </header>

      <SummaryCards summary={summary} />

      <div className="goal-grid">
        <SavingsGoal summary={summary} />
        <SavingsTable income={summary?.monthlyIncome} />
      </div>

      <div className="dashboard-grid">
        <TransactionForm onAdded={refresh} />

        <section className="card">
          <div className="card-head">
            <h2>Recent transactions</h2>
            <Link to="/transactions" className="link">
              View all →
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
