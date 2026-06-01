import { formatMoney, formatDate } from '../utils/format'

export default function TransactionList({ transactions, onDelete }) {
  if (!transactions?.length) {
    return <p className="muted empty">No transactions yet. Add your first one above.</p>
  }

  return (
    <ul className="tx-list">
      {transactions.map((t) => (
        <li key={t._id} className={`tx-item ${t.type}`}>
          <div className="tx-main">
            <span className="tx-cat">{t.category}</span>
            {t.description && <span className="tx-desc">{t.description}</span>}
            <span className="tx-date">{formatDate(t.date)}</span>
          </div>
          <div className="tx-side">
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
          </div>
        </li>
      ))}
    </ul>
  )
}
