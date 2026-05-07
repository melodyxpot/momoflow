Build a production-ready URL shortener and smart redirect platform (similar to Cuttly) in C:/Workspace/momoflow using a **Turborepo monorepo architecture**.

---

## 🧱 TECH STACK

* Monorepo: Turborepo
* Frontend: Next.js (App Router) + HeroUI
* Backend: Express.js (Node.js)
* Database: MongoDB (Mongoose)
* Cache: Redis (for high-speed redirects)
* Package Manager: pnpm (preferred)
* Language: TypeScript across all apps/packages

---

## 🏗️ MONOREPO STRUCTURE

Use a Turborepo layout:

/apps
/web        → Next.js frontend (dashboard + UI)
/api        → Express.js backend (REST API + redirect engine)

/packages
/ui         → Shared UI components (HeroUI wrappers)
/config     → Shared configs (eslint, tsconfig)
/lib        → Shared utilities (helpers, validators, types)

/prisma or /db (optional)
→ Database schema and models (if centralized)

---

## 🎯 PROJECT GOAL

Develop a scalable, secure, and high-performance URL shortening platform with:

* Modern UI/UX dashboard
* Advanced redirect logic
* Analytics tracking
* Enterprise-level performance optimizations

---

## 🔑 CORE FEATURES

### 1. Link Shortening

* Generate short codes using nanoid (6–8 chars)
* Support custom aliases
* URL validation and sanitization
* Prevent collisions with unique index

---

### 2. Redirect Engine (CRITICAL PATH)

* Route: GET / (in backend)
* Use Redis cache for instant lookup
* Fallback to MongoDB on cache miss
* Perform HTTP 302 redirect
* Log analytics asynchronously (non-blocking)
* Target latency: <50ms

---

### 3. Dashboard (Next.js + HeroUI)

Build a modern SaaS-style dashboard:

Pages:

* Overview (stats, charts)
* Create Link
* Manage Links (table with filters/search)
* Link Detail (analytics)

UX:

* Responsive design
* Copy short link button
* QR code generator
* Dark/light mode
* Optimistic UI updates

---

### 4. Analytics System

Track:

* Total clicks
* Unique clicks (IP hash + UA)
* Country (GeoIP)
* Device type
* Referrer

Store analytics efficiently (separate collection)

---

### 5. Advanced Redirect Rules

* Geo-based redirect
* Device-based redirect
* A/B testing (weighted routing)
* Expiration date
* Password-protected links

---

### 6. Authentication & Security

* JWT authentication
* Role-based access (user/admin)
* Rate limiting (anti-abuse)
* Input validation (Zod preferred)
* Helmet.js for security headers
* Prevent open redirect vulnerabilities
* Sanitize all inputs

---

### 7. Performance Optimization

* Redis caching for hot links
* Async analytics logging (queue-based preferred)
* Proper DB indexing:

  * code (unique)
  * userId
  * createdAt
* Compression (gzip)
* CDN-friendly headers

---

## 🔌 API DESIGN (Express.js in /apps/api)

Endpoints:

POST   /api/links         → Create short link
GET    /             → Redirect handler
GET    /api/links         → List user links
GET    /api/links/     → Link detail
DELETE /api/links/
GET    /api/stats/   → Analytics

---

## 🗄️ DATABASE SCHEMA (MONGOOSE)

Link:

* code (unique string)
* targetUrl
* userId
* clicks
* createdAt
* expiresAt
* rules (geo/device/ab testing config)

Analytics:

* linkId
* timestamp
* ipHash
* country
* device
* referrer

---

## 📦 SHARED PACKAGES

### /packages/ui

* Reusable HeroUI-based components
* Buttons, modals, tables, layout

### /packages/lib

* URL validation
* nanoid generator wrapper
* analytics helpers
* shared types (TypeScript)

### /packages/config

* Shared ESLint config
* Shared tsconfig base

---

## ⚙️ TURBO CONFIG

* Use pipeline:

  * build
  * dev
  * lint
  * type-check
* Enable caching for builds
* Parallel execution where possible

---

## 🧑‍💻 DEV EXPERIENCE

* Strict TypeScript setup
* Absolute imports
* Environment variables per app
* Use .env.local files

---

## 🚀 DEPLOYMENT

* Dockerize both apps
* Use PM2 for backend
* Setup reverse proxy (Nginx)
* Ensure scalable deployment readiness

---

## ⚡ NON-FUNCTIONAL REQUIREMENTS

* High performance under load
* Clean modular architecture
* Maintainable codebase
* Proper error handling
* Logging (Winston or similar)

---

## 🧠 BONUS FEATURES

* Bulk link creation (CSV upload)
* API key system
* Custom domains support
* Webhooks (on click events)
* Link preview page
* Bot detection (basic filtering)

---

## 📁 EXPECTED OUTPUT

* Complete Turborepo project
* Working frontend + backend
* Clean folder structure
* README with setup instructions
* Environment config examples

---

## 🚨 IMPORTANT

* Prioritize redirect speed and stability
* Avoid blocking logic in redirect route
* Ensure scalability from the start
* Code must be production-ready

---

End of instructions.
