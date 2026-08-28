# BudgetWise

A full-stack budget tracker. Sign up, log income and expenses, see **monthly** totals, and chat with an AI coach about your spending.

- **Frontend:** React 19 + Vite + React Router
- **Backend:** Node.js + Express 5 REST API
- **Database:** MongoDB (Mongoose)
- **Auth:** Email/password (bcrypt + JWT)
- **AI:** Groq or Gemini (optional)

## Features

- Monthly income, expenses, and savings on the dashboard
- Add / delete transactions with category, description, and date
- Transaction history (last 10) + full list with filters (this month, all time, income/expense)
- AI budget chat using your real monthly numbers

## Project structure

```
budgetWise/
├── backend/           # Express API
│   ├── models/        # User, Transaction
│   ├── routes/        # auth, transactions, advice
│   ├── services/      # AI chat (Groq / Gemini)
│   └── utils/         # summary, validation
└── my-react-app/      # React SPA
    └── src/
        ├── pages/     # Home, Login, Signup, Dashboard, TransactionHistory, AllTransactions
        ├── components/
        └── hooks/
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup & run

### Backend

```bash
cd backend
npm install
cp .env.example .env    # edit JWT_SECRET and MONGO_URI
npm run dev             # http://localhost:5000
```

| Variable | Description |
| -------- | ----------- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs (required in production) |
| `CLIENT_ORIGIN` | Frontend URL for CORS, e.g. `http://localhost:5173` |
| `GROQ_API_KEY` | Groq API key for AI chat (optional) |
| `AI_PROVIDER` | `groq` (default) or `gemini` |

### Frontend

```bash
cd my-react-app
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:5000` when `VITE_API_URL` is empty.

## Production

**Backend:** Set `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, and `GROQ_API_KEY`. Start with `npm start`.

**Frontend:** Set `VITE_API_URL` to your deployed API origin (no `/api` suffix). Build with `npm run build` and deploy `dist/`.

## API

Protected routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/transactions` | List + monthly summary |
| POST | `/api/transactions` | Add transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| POST | `/api/advice/chat` | AI budget chat |
| GET | `/api/health` | Health check |

## Security

- **Never commit `.env` files** — they are gitignored
- Use `.env.example` as a template only
- Rotate API keys if they were ever shared or committed
