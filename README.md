<<<<<<< HEAD
# Budget Balancer

A multipage budget balancer web app. Users sign up / log in, add transactions, and
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
# Edit .env and set a strong JWT_SECRET (and MONGO_URI if not local)
npm run dev        # starts API on http://localhost:5000 (auto-reload)
```

Environment variables (`backend/.env`):

| Variable      | Description                          | Default                                      |
| ------------- | ------------------------------------ | -------------------------------------------- |
| `PORT`        | API port                             | `5000`                                       |
| `MONGO_URI`   | MongoDB connection string            | `mongodb://127.0.0.1:27017/budget_balancer`  |
| `JWT_SECRET`  | Secret used to sign JWTs             | _change this_                                |
| `JWT_EXPIRES_IN` | Token lifetime                    | `7d`                                         |

### 2. Frontend

```bash
cd my-react-app
npm install
npm run dev        # starts Vite on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so run the
backend at the same time.

Then open http://localhost:5173, sign up, and start adding transactions.

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
=======
# Budget_Balancer
>>>>>>> d88fbc956b2d0436a7d29aef8032f0d8e9174ed2
