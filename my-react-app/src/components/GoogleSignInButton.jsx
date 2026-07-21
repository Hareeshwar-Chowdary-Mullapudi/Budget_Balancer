import { useEffect, useRef, useState } from 'react'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

function loadGisScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  const existing = document.querySelector(`script[src="${GIS_SRC}"]`)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In')))
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(script)
  })
}

function googleLoginUri() {
  const apiRoot = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (apiRoot) return `${apiRoot}/api/auth/google/callback`
  // Local Vite proxy: Google must hit the API host directly (not the Vite origin).
  return 'http://localhost:5000/api/auth/google/callback'
}

export default function GoogleSignInButton({ onError, disabled }) {
  const buttonRef = useRef(null)
  const onErrorRef = useRef(onError)
  const [ready, setReady] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  onErrorRef.current = onError

  useEffect(() => {
    if (!clientId || disabled) return undefined

    let cancelled = false
    const loginUri = googleLoginUri()

    loadGisScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return

        // Redirect mode avoids popup blockers (common on mobile / strict browsers).
        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'redirect',
          login_uri: loginUri,
          auto_select: false,
        })

        buttonRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: buttonRef.current.offsetWidth || 352,
        })
        setReady(true)
      })
      .catch((err) => {
        if (!cancelled) onErrorRef.current?.(err.message || 'Failed to load Google Sign-In')
      })

    return () => {
      cancelled = true
    }
  }, [clientId, disabled])

  if (!clientId) {
    return (
      <p className="muted small auth-google-hint">
        Google sign-in is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code>.
      </p>
    )
  }

  return (
    <div className="auth-google">
      <div className="auth-divider">
        <span>or</span>
      </div>
      <div
        ref={buttonRef}
        className={`auth-google-btn${disabled || !ready ? ' is-disabled' : ''}`}
        aria-busy={!ready}
      />
    </div>
  )
}
