# MomoFlow

A production-ready URL shortener and smart redirect platform built as a **Turborepo monorepo**.

> Branded short links, geo / device / A-B routing, password-protected links,
> Redis-cached redirects (sub-50ms hot path), and real-time analytics.

---

## ✨ Features

- **High-performance redirect engine** — Redis lookup with negative caching, MongoDB fallback, async analytics writes.
- **Custom aliases & nanoid codes** — collision-resistant, reserved-word safe.
- **Smart routing rules** — geo (GeoIP), device (UA-parser), weighted A/B variants.
- **Password-protected links** & expiration dates.
- **Analytics** — total/unique clicks, country, device, OS, browser, referrer, daily series.
- **JWT auth** with role-based access (user / admin), bcrypt hashing.
- **Hardened Express API** — Helmet, CORS, rate limiting, Zod validation, sanitized URLs (no `javascript:` / private IP targets).
- **Modern Next.js 14 dashboard** with HeroUI, dark mode, optimistic UI, QR codes, charts.

---

## 🧱 Stack

| Layer        | Tech                                      |
|--------------|-------------------------------------------|
| Monorepo     | Turborepo + pnpm workspaces               |
| Frontend     | Next.js 14 (App Router), HeroUI, Tailwind |
| Backend      | Express.js, TypeScript                    |
| Database     | MongoDB (Mongoose)                        |
| Cache        | Redis (ioredis)                           |
| Auth         | JWT + bcryptjs                            |
| Validation   | Zod (shared types via `@momoflow/lib`)    |
| Logging      | Winston + Morgan                          |
| Charts       | Recharts                                  |

---

## 📂 Structure

```
momoflow/
├── apps/
│   ├── api/        # Express backend (REST API + redirect engine)
│   └── web/        # Next.js dashboard
├── packages/
│   ├── ui/         # Shared HeroUI-based components
│   ├── lib/        # Shared types, validators, helpers
│   └── config/     # Shared tsconfig + eslint
├── deploy/
│   └── nginx.conf  # Reverse-proxy example
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 🚀 Quick start

### Prerequisites
- Node.js 18+
- pnpm 9+ (`corepack enable`)
- MongoDB & Redis (locally or via Docker)

### 1. Install
```bash
pnpm install
```

### 2. Environment
Copy the example file to each app:
```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```
Adjust values (DB URIs, JWT secret, public base URLs).

### 3. Run infrastructure (optional, via Docker)
```bash
docker compose up -d mongo redis
```

### 4. Develop
```bash
pnpm dev
```
- Web → http://localhost:3000
- API → http://localhost:4000
- Redirects → `http://localhost:4000/<code>`

### 5. Build
```bash
pnpm build
```

---

## 🔌 API summary

| Method | Path                | Description                              |
|--------|---------------------|------------------------------------------|
| POST   | `/api/auth/register`| Create user + return JWT                 |
| POST   | `/api/auth/login`   | Email/password login                     |
| GET    | `/api/auth/me`      | Current user                             |
| POST   | `/api/links`        | Create short link                        |
| GET    | `/api/links`        | List user links (paginated, search)      |
| GET    | `/api/links/:id`    | Link detail                              |
| PATCH  | `/api/links/:id`    | Update link                              |
| DELETE | `/api/links/:id`    | Delete link                              |
| GET    | `/api/stats`        | Account-wide totals + top links          |
| GET    | `/api/stats/:id`    | Per-link analytics breakdown             |
| GET    | `/:code`            | **Public redirect** (Redis-cached)       |
| GET    | `/health`           | Health check                             |

All authed routes use `Authorization: Bearer <jwt>`.

---

## 🐳 Docker

Spin everything up:
```bash
docker compose up --build
```

The compose file provisions Mongo, Redis, the API, and the web app.

For production behind Nginx, see [`deploy/nginx.conf`](deploy/nginx.conf).
For PM2 cluster mode on the API, see [`apps/api/ecosystem.config.cjs`](apps/api/ecosystem.config.cjs).

---

## ⚙️ Performance notes

- **Redirect path** uses Redis with a 1h positive TTL and a 60s negative TTL to absorb 404 floods.
- **Analytics writes** are pushed onto `setImmediate` — the redirect responds in microseconds.
- **MongoDB indexes**: `code` (unique), `userId+createdAt`, `linkId+timestamp`, `linkId+ipHash` for unique-click computation.
- **Compression + Helmet + CORS** are enabled on every API response.
- The redirect route is mounted **last**, after `/api/*`, so dashboard endpoints can't be shadowed by user-supplied codes.

---

## 🛡️ Security

- URLs sanitized to `http(s)` only; private/loopback hosts rejected by default.
- Reserved short-codes (`api`, `dashboard`, `login`, …) blocked.
- JWT secret validated at boot (`zod`).
- bcrypt password hashes; rate limiter on `/api/auth/*`.
- Helmet security headers, `x-powered-by` disabled.

---

## 📜 License

MIT
