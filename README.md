# BudgetWise

A multipage budget tracking web app. Users sign up / log in, add transactions, and
the app automatically splits everything into **income**, **expense**, and the
remaining **savings** (`savings = income − expense`).

- **Frontend:** React 19 + Vite + React Router (multipage SPA)
- **Backend:** Node.js + Express 5 REST API
- **Database:** MongoDB (via Mongoose) — stores users and their transactions
- **Auth:** Email/password with bcrypt-hashed passwords and JWT tokens

## Project structure

```
budget/
├─ backend/                # Express + MongoDB API
│  ├─ models/              # User, Transaction (Mongoose schemas)
│  ├─ routes/              # auth.js, transactions.js
│  ├─ middleware/auth.js   # JWT verification
│  ├─ server.js            # App entry point
│  └─ .env                 # Config (PORT, MONGO_URI, JWT_SECRET)
└─ my-react-app/           # React + Vite frontend
   └─ src/
      ├─ pages/            # Home, Login, Signup, Dashboard, Transactions
      ├─ components/       # Navbar, SummaryCards, TransactionForm, TransactionList, ProtectedRoute
      ├─ context/          # AuthContext (login/signup/logout state)
      ├─ hooks/            # useTransactions (fetch + summary)
      └─ api.js            # fetch-based API client (adds JWT header)
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local `mongodb://127.0.0.1:27017` or MongoDB Atlas)

## Setup & run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit JWT_SECRET (and MONGO_URI if not local)
npm run dev            # starts API on http://localhost:5000 (auto-reload)
```

Environment variables (`backend/.env`):

| Variable         | Description                          | Default                                      |
| ---------------- | ------------------------------------ | -------------------------------------------- |
| `PORT`           | API port                             | `5000`                                       |
| `MONGO_URI`      | MongoDB connection string            | `mongodb://127.0.0.1:27017/budget_wise`  |
| `JWT_SECRET`     | Secret used to sign JWTs             | _required in production_                     |
| `JWT_EXPIRES_IN` | Token lifetime                       | `7d`                                         |
| `CLIENT_ORIGIN`  | Allowed CORS origins (comma-separated) | _all origins in dev_                     |
| `NODE_ENV`       | Set to `production` on your host     | `development`                                |

### 2. Frontend

```bash
cd my-react-app
npm install
cp .env.example .env     # optional locally; Vite proxies /api to :5000
npm run dev              # starts Vite on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so run the
backend at the same time.

Then open http://localhost:5173, sign up, and start adding transactions.

## Production build

```bash
cd my-react-app
npm run build            # output in my-react-app/dist
```

```bash
cd backend
npm start                # NODE_ENV=production, MONGO_URI, JWT_SECRET required
```

## Deployment

Typical split deploy: **static frontend** (Netlify, Vercel, Cloudflare Pages) +
**Node API** (Render, Railway, Fly.io) + **MongoDB Atlas**.

### Backend (API)

1. Create a MongoDB Atlas cluster and copy the connection string into `MONGO_URI`.
2. Set environment variables on your host:
   - `NODE_ENV=production`
   - `MONGO_URI` — Atlas connection string
   - `JWT_SECRET` — long random string (32+ characters)
   - `CLIENT_ORIGIN` — your frontend URL(s), e.g. `https://my-app.netlify.app`
3. Start command: `npm start` (root: `backend/`).
4. Health check: `GET /api/health`

### Frontend (static)

1. Set `VITE_API_URL` to your deployed API origin **without** `/api`, e.g.
   `https://budget-api.onrender.com`
2. Build command: `npm run build` (root: `my-react-app/`)
3. Publish directory: `dist`
4. SPA routing is configured via `public/_redirects` (Netlify) and `vercel.json` (Vercel).

If frontend and API share the same domain behind a reverse proxy that forwards
`/api` to the backend, leave `VITE_API_URL` empty.

## API reference

All `/transactions` routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint                 | Description                                  |
| ------ | ------------------------ | -------------------------------------------- |
| POST   | `/api/auth/signup`       | Create account → `{ token, user }`           |
| POST   | `/api/auth/login`        | Log in → `{ token, user }`                   |
| GET    | `/api/auth/me`           | Current user (requires token)                |
| GET    | `/api/transactions`      | List transactions + `{ income, expense, savings, count }` summary |
| POST   | `/api/transactions`      | Add a transaction (`type`, `amount`, `category`, `description`, `date`) |
| DELETE | `/api/transactions/:id`  | Delete a transaction                         |

`type` must be `"income"` or `"expense"`. The savings figure is derived as
`income − expense` and recomputed on every fetch.
