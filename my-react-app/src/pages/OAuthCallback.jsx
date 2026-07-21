import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OAuthCallback() {
  const { completeOAuthLogin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash
    const params = new URLSearchParams(hash)
    const token = params.get('token')

    if (!token) {
      setError('Missing sign-in token. Please try again.')
      return undefined
    }

    completeOAuthLogin(token)
      .then(() => {
        if (cancelled) return
        window.history.replaceState(null, '', '/oauth/callback')
        navigate('/dashboard', { replace: true })
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.response?.data?.message || err.message || 'Unable to finish Google sign-in')
      })

    return () => {
      cancelled = true
    }
    // Run once on mount with the hash token from the redirect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Signing you in…</h1>
        {error ? (
          <>
            <div className="alert alert-error">{error}</div>
            <p className="muted small">
              <Link to="/login">Back to login</Link>
            </p>
          </>
        ) : (
          <p className="muted">Finishing Google sign-in. You will be redirected shortly.</p>
        )}
      </div>
    </div>
  )
}
