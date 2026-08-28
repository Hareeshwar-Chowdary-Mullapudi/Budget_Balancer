import { useCallback, useEffect, useState } from 'react'
import api from '../api'

const EMPTY_SUMMARY = { income: 0, expense: 0, savings: 0, count: 0, monthCount: 0, monthLabel: '' }

export default function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)

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
