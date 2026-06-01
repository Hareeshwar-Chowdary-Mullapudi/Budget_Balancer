import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="hero">
      <h1>Balance your budget with clarity</h1>
      <p className="hero-sub">
        Track every transaction in one place. We automatically split your money into
        <strong> income</strong>, <strong>expenses</strong> and your remaining
        <strong> savings</strong>.
      </p>
      <div className="hero-actions">
        {user ? (
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get started — it's free
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              I already have an account
            </Link>
          </>
        )}
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <h2>📥 Log transactions</h2>
          <p>Add income or expenses with a category, note and date in seconds.</p>
        </div>
        <div className="feature-card">
          <h2>📊 Auto split</h2>
          <p>See totals broken into income, expense and savings instantly.</p>
        </div>
        <div className="feature-card">
          <h2>🔒 Private & secure</h2>
          <p>Your data is tied to your account with encrypted passwords.</p>
        </div>
      </div>
    </div>
  )
}
