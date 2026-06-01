import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Only "loading" if we have a token to validate against the server.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))

  // On load, if a token exists, fetch the current user
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('token')
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  async function signup(name, email, password) {
    const res = await api.post('/auth/signup', { name, email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
