// Empty VITE_API_URL → relative /api (Vite dev proxy or same-origin deploy).
const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const BASE_URL = API_ROOT ? `${API_ROOT}/api` : '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    // Mirror axios shape so existing components can read err.response.data.message
    this.response = { status, data }
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch only rejects on network-level failures (server down, CORS, offline)
    throw new ApiError(
      'Cannot reach the server. Check your connection and that the API is running.',
      0,
      null
    )
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.message || 'Request failed', res.status, data)
  }

  return { data }
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}

export default api
