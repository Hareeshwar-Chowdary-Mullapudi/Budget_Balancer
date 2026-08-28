import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setResetUrl('')
    setSubmitting(true)

    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data.message)
      if (res.data.resetUrl) setResetUrl(res.data.resetUrl)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Forgot password</h1>
        <p className="muted">Enter your email and we&apos;ll help you reset your password.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <label>
          Email <span className="required">*</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>

        {resetUrl && (
          <p className="muted small">
            Dev reset link:{' '}
            <Link to={resetUrl} className="link">
              Set new password
            </Link>
          </p>
        )}

        <p className="muted small">
          <Link to="/login">← Back to login</Link>
        </p>
      </form>
    </div>
  )
}
