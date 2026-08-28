function isSameMonth(date, referenceDate) {
  const d = new Date(date)
  return (
    d.getFullYear() === referenceDate.getFullYear() &&
    d.getMonth() === referenceDate.getMonth()
  )
}

export function buildSummary(transactions, referenceDate = new Date()) {
  const monthTx = transactions.filter((t) => isSameMonth(t.date, referenceDate))

  const income = monthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = monthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    income,
    expense,
    savings: income - expense,
    count: transactions.length,
    monthCount: monthTx.length,
    monthLabel: referenceDate.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    }),
  }
}
