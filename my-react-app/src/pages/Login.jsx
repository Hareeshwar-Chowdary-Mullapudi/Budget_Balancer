import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to log in')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle(credential) {
    setError('')
    setSubmitting(true)
    try {
      await loginWithGoogle(credential)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to sign in with Google')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="muted">Log in to manage your budget.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <GoogleSignInButton
          onCredential={handleGoogle}
          onError={setError}
          disabled={submitting}
        />

        <p className="muted small">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  )
}
