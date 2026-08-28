export function isSameMonth(date, referenceDate = new Date()) {
  const d = new Date(date)
  return (
    d.getFullYear() === referenceDate.getFullYear() &&
    d.getMonth() === referenceDate.getMonth()
  )
}

export function filterByPeriod(transactions, period) {
  if (period === 'month') {
    return transactions.filter((t) => isSameMonth(t.date))
  }
  return transactions
}

export function monthLabel(referenceDate = new Date()) {
  return referenceDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}
