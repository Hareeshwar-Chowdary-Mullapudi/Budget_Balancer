import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tokenFromUrl = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!tokenFromUrl) {
      setError('Reset link is missing or invalid.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/auth/reset-password', {
        token: tokenFromUrl,
        password,
      })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not reset password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Set new password</h1>
        <p className="muted">Choose a new password for your account.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <label>
          New password <span className="required">*</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <label>
          Confirm password <span className="required">*</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <button className="btn btn-primary" disabled={submitting || !tokenFromUrl}>
          {submitting ? 'Saving…' : 'Update password'}
        </button>

        <p className="muted small">
          <Link to="/login">← Back to login</Link>
        </p>
      </form>
    </div>
  )
}
