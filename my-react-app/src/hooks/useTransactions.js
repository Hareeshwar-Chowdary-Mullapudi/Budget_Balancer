import { useCallback, useEffect, useState } from 'react'
import api from '../api'

const EMPTY_SUMMARY = {
  income: 0,
  expense: 0,
  savings: 0,
  count: 0,
  months: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
  monthlySavings: 0,
}

export default function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)

  // Returns a promise; state is set inside the async callback (not synchronously).
  const refresh = useCallback(() => {
    return api.get('/transactions').then((res) => {
      setTransactions(res.data.transactions)
      setSummary(res.data.summary)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(
    (id) => api.delete(`/transactions/${id}`).then(refresh),
    [refresh]
  )

  return { transactions, summary, loading, refresh, remove }
}
