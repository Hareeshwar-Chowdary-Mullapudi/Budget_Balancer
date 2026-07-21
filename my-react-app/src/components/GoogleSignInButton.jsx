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

export default function GoogleSignInButton({ onCredential, onError, disabled }) {
  const buttonRef = useRef(null)
  const onCredentialRef = useRef(onCredential)
  const onErrorRef = useRef(onError)
  const [ready, setReady] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  onCredentialRef.current = onCredential
  onErrorRef.current = onError

  useEffect(() => {
    if (!clientId || disabled) return undefined

    let cancelled = false

    loadGisScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              onCredentialRef.current?.(response.credential)
            } else {
              onErrorRef.current?.('Google sign-in was cancelled or failed')
            }
          },
          ux_mode: 'popup',
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
