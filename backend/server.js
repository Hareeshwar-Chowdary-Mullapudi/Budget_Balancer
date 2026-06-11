import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production')
  process.exit(1)
}

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : null

const app = express()

if (allowedOrigins?.length) {
  app.use(cors({ origin: allowedOrigins, credentials: true }))
} else {
  app.use(cors())
}
app.use(express.json())

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbOk = dbState === 1 // 1 = connected
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/budget_balancer'

// Listen immediately so the host health check works even while DB connects.
app.listen(PORT, () => console.log(`API running on port ${PORT}`))

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    console.error('API is up but database routes will fail until MONGO_URI is fixed.')
  })
