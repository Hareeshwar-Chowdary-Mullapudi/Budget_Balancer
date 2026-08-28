import { useRef, useState } from 'react'
import api from '../api'

const WELCOME =
  'Ask about your budget — I answer only what you ask, using your numbers when relevant.'

export default function AiBudgetChat() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const history = nextMessages.filter((m) => m.content !== WELCOME)
      const res = await api.post('/advice/chat', {
        message: text,
        history: history.slice(0, -1),
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }])
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
      }, 50)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not reach AI')
      setMessages((prev) => prev.slice(0, -1))
      setInput(text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card advice-card ai-chat-card">
      <div className="card-title-row">
        <span className="card-icon" aria-hidden="true">
          💬
        </span>
        <h2>AI budget coach</h2>
      </div>
      <p className="muted small card-desc">Focused answers to your questions — no extra advice.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="ai-chat-messages" ref={listRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`ai-chat-bubble ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="ai-chat-bubble assistant muted">Thinking…</div>}
      </div>

      <form className="ai-chat-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask how to manage your budget…"
          disabled={loading}
          maxLength={500}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  )
}
