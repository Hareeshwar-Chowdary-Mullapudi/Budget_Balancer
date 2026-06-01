const BASE_URL = '/api'

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
      'Cannot reach the server. Make sure the backend is running on http://localhost:5000.',
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
