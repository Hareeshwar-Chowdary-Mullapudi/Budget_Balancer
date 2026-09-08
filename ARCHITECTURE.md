# BudgetWise — Architecture

Interview-friendly overview of how the app is structured and how a request flows through the system.

## Stack


| Layer    | Tech                                   |
| -------- | -------------------------------------- |
| Frontend | React 19 + Vite + React Router         |
| Backend  | Node.js + Express 5                    |
| Database | MongoDB (Mongoose)                     |
| Auth     | JWT (Bearer) + bcrypt password hashing |
| AI       | Groq chat API (server-side)            |


## High-level diagram

```
┌─────────────────────────────┐
│  Browser (React SPA)        │
│  localhost:5173 / Vercel    │
│                             │
│  AuthContext (JWT in        │
│  localStorage)              │
│  api.js → fetch + Bearer    │
└──────────────┬──────────────┘
               │  /api/*
               │  (Vite proxy in dev)
               ▼
┌─────────────────────────────┐
│  Express API                │
│  localhost:5000 / Render    │
│                             │
│  CORS + JSON middleware     │
│  auth middleware (JWT)      │
│  routes → services/utils    │
└───────┬──────────┬──────────┘
        │          │
        ▼          ▼
   MongoDB      Groq
   (users +     (AI chat)
    transactions)
```



## Folder map

```
budgetWise/
├── README.md
├── ARCHITECTURE.md          ← this file
├── backend/
│   ├── server.js            # Express entry, CORS, routes, Mongo connect
│   ├── middleware/auth.js   # JWT verify → req.userId
│   ├── models/
│   │   ├── User.js          # account + hashed password
│   │   └── Transaction.js   # income/expense per user
│   ├── routes/
│   │   ├── auth.js          # signup, login, me
│   │   ├── transactions.js  # list / add / delete (auth required)
│   │   └── advice.js        # AI chat (auth required)
│   ├── services/
│   │   └── aiAdvice.js      # Groq prompt + chat
│   └── utils/
│       ├── summary.js       # monthly income / expense / savings
│       └── validate.js      # email normalize + format check
└── my-react-app/
    ├── vite.config.js       # proxies /api → :5000 in local dev
    ├── vercel.json          # SPA rewrite for production
    └── src/
        ├── main.jsx         # Router + AuthProvider
        ├── App.jsx          # route table
        ├── api.js           # fetch client + JWT header
        ├── context/AuthContext.jsx
        ├── hooks/useTransactions.js
        ├── pages/           # screens
        ├── components/      # UI pieces
        └── utils/           # format + client filters
```



## Request flows



### 1. Sign up / log in

1. User submits form on `Login` / `Signup`.
2. Frontend calls `POST /api/auth/signup` or `/login`.
3. Backend hashes password (bcrypt) on create, or compares hash on login.
4. Backend returns `{ token, user }`.
5. `AuthContext` saves `token` in `localStorage` and sets `user`.
6. Later requests send `Authorization: Bearer <token>`.



### 2. Load dashboard

1. `ProtectedRoute` waits for auth; redirects to `/login` if no user.
2. `useTransactions` calls `GET /api/transactions`.
3. Auth middleware verifies JWT → `req.userId`.
4. Route loads that user’s transactions and runs `buildSummary()` (current month).
5. UI shows `SummaryCards`, recent list, AI chat, and add form.



### 3. Add a transaction

1. `TransactionForm` → `POST /api/transactions`.
2. Backend validates type/amount and saves with `user: req.userId`.
3. Frontend `refresh()` reloads list + monthly summary.



### 4. AI budget chat

1. `AiBudgetChat` → `POST /api/advice/chat` with `{ message, history }`.
2. Backend loads user transactions → `buildSummary()`.
3. `chatWithAi()` builds a system prompt with monthly totals and calls Groq.
4. Reply is returned; API key never leaves the server.



## Data model (simplified)

```
User
  name, email, password (hashed)

Transaction
  user → User
  type: "income" | "expense"
  amount, category, description, date
```

**Monthly summary (not stored — computed):**

```
income  = sum of this month's income
expense = sum of this month's expenses
savings = income − expense
```



## Auth model

- **Stateless JWT** — no server session store.
- Token payload: `{ id: userId }`.
- Private routes: `middleware/auth.js` sets `req.userId`.
- Frontend restore: on load, if token exists → `GET /api/auth/me`.



## Environments


| Setting  | Local                                         | Production                          |
| -------- | --------------------------------------------- | ----------------------------------- |
| Frontend | Vite `:5173`, empty `VITE_API_URL` (proxy)    | Vercel, `VITE_API_URL` = API origin |
| Backend  | `npm run dev` (`--use-system-ca`)             | Render `npm start`                  |
| MongoDB  | `127.0.0.1` or Atlas                          | Atlas                               |
| CORS     | `CLIENT_ORIGIN=http://localhost:5173,...`     | Frontend URL(s)                     |
| AI       | `GROQ_API_KEY` in backend `.env`              | Same on host env                    |




## Design choices (interview talking points)

1. **Monthly totals on the backend** — same numbers for dashboard and AI; one place to change rules.
2. **JWT over sessions** — simple for SPA + separate API host.
3. **AI on the server** — Groq key never exposed in the browser.
4. **User-scoped queries** — every transaction query filters by `req.userId`.
5. **Vite proxy** — local frontend uses relative `/api` without hardcoding the API URL.



## Main routes (quick reference)


| Method | Path                        | Auth | Purpose            |
| ------ | --------------------------- | ---- | ------------------ |
| GET    | `/api/health`               | No   | Health / DB status |
| POST   | `/api/auth/signup`          | No   | Create account     |
| POST   | `/api/auth/login`           | No   | Log in             |
| GET    | `/api/auth/me`              | Yes  | Current user       |
| GET    | `/api/transactions`         | Yes  | List + summary     |
| POST   | `/api/transactions`         | Yes  | Add                |
| DELETE | `/api/transactions/:id`     | Yes  | Delete             |
| POST   | `/api/advice/chat`          | Yes  | AI reply           |


