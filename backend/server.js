import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'
import adviceRoutes from './routes/advice.js'

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean)
  : null

const app = express()

if (allowedOrigins?.length) {
  app.use(cors({ origin: allowedOrigins, credentials: true }))
} else {
  app.use(cors())
}
app.use(express.json())

app.get('/api/health', (req, res) => {
  const dbOk = mongoose.connection.readyState === 1
  res.status(dbOk ? 200 : 503).json({ status: dbOk ? 'ok' : 'degraded' })
})

app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/advice', adviceRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/budget_wise'

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`)
  if (process.env.GROQ_API_KEY) {
    console.log('Groq AI: configured')
  } else {
    console.log('Groq AI: GROQ_API_KEY missing in .env')
  }
})

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err.message))
