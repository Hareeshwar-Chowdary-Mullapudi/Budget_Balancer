import { formatMoney, formatDate } from '../utils/format'

export default function TransactionList({ transactions, onDelete }) {
  if (!transactions?.length) {
    return (
      <div className="empty-state empty-state-compact">
        <span className="empty-state-icon" aria-hidden="true">
          📋
        </span>
        <p className="empty-state-title">No transactions yet</p>
        <p className="muted small">Your recent activity will show up here.</p>
      </div>
    )
  }

  const gridClass = onDelete ? 'tx-row tx-row-delete' : 'tx-row'

  return (
    <ul className="tx-list">
      {transactions.map((t) => (
        <li key={t._id} className={`tx-item ${gridClass} ${t.type}`}>
          <span className={`tx-type-dot ${t.type}`} aria-hidden="true" />
          <div className="tx-details">
            <span className="tx-cat">{t.category}</span>
            {t.description ? <span className="tx-desc">{t.description}</span> : null}
          </div>
          <span className="tx-date">{formatDate(t.date)}</span>
          <span className={`tx-amount ${t.type}`}>
            {t.type === 'income' ? '+' : '−'}
            {formatMoney(t.amount).replace('-', '')}
          </span>
          {onDelete && (
            <button
              className="btn-delete"
              title="Delete"
              onClick={() => onDelete(t._id)}
            >
              ✕
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
