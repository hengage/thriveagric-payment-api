# Payment Platform API

> RESTful payment processing API for a freelance platform.  
> Express.js · Sequelize-TypeScript · PostgreSQL · Docker · TypeScript

---

## Table of Contents

1. [Setup](#1-setup)
2. [Environment Variables](#2-environment-variables)
3. [Design Decisions](#3-design-decisions)
4. [Stretch Goals — What I Picked and Why](#4-stretch-goals--what-i-picked-and-why)
5. [Payment Atomicity](#5-payment-atomicity)
6. [The Scale Question](#6-the-scale-question)
7. [Trade-offs & What I'd Do Differently](#7-trade-offs--what-id-do-differently)
8. [API Documentation](#8-api-documentation)

---

## 1. Setup

### With Docker (recommended — no local Postgres needed)

```bash
git clone <repo-url>
cd thriveagric-payment-api

cp .env.example .env
# Fill in any values you want to change — defaults work out of the box with Docker

docker-compose up --build
```

The container runs `db:sync` → `seed` → `start:dev` automatically on startup. The API will be available at `http://localhost:3001`.

### Without Docker (local Postgres required)

```bash
git clone <repo-url>
cd payment-api

npm install

cp .env.example .env
# Set DATABASE_URL to point at your local Postgres instance

npm run db:sync     # creates tables
npm run seed        # inserts test profiles, contracts, and jobs
npm run dev         # starts ts-node-dev with hot reload
```

### Running Tests

```bash
# Requires a separate test database
DATABASE_URL=postgres://postgres:password@localhost:5432/thriveagric-payment-api
```
`npm run test`

Tests run serially (`--runInBand`) to avoid race conditions between suites sharing the same database.

---

## 2. Environment Variables

Copy `.env.example` to `.env`. All variables have sensible defaults except `DATABASE_URL` and `ALLOWED_HEADERS` which are required — the server will refuse to start without them.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Postgres connection string |
| `ALLOWED_HEADERS` | ✅ | — | Comma-separated custom CORS headers. Must include `profile_id,Idempotency-Key` |
| `NODE_ENV` | | `development` | `development` / `production` / `test` |
| `PORT` | | `3001` | Server port |
| `DEPOSIT_LIMIT_RATIO` | | `0.25` | Max deposit as a fraction of total unpaid jobs (25%) |
| `RATE_LIMIT_GENERAL` | | `100` | Max requests per minute per profile for general endpoints |
| `RATE_LIMIT_ANALYTICS` | | `30` | Max requests per minute per profile for admin analytics |
| `ALLOWED_ORIGINS` | | `*` | Comma-separated allowed CORS origins |

```bash
# .env.example
DATABASE_URL=postgres://postgres:password@localhost:5432/thriveagric-payment-api
NODE_ENV=development
PORT=3001
DEPOSIT_LIMIT_RATIO=0.25
RATE_LIMIT_GENERAL=100
RATE_LIMIT_ANALYTICS=30
ALLOWED_ORIGINS=http://localhost:3000
ALLOWED_HEADERS=profile_id,Idempotency-Key
```

---

## 3. Design Decisions

### Why PostgreSQL over MongoDB?

Money moves between rows that need relational integrity. `clientId` and `contractorId` on a contract must reference real profiles — a document store gives you no referential guarantee at the database level. If a profile is deleted, MongoDB would leave orphaned contracts pointing at a non-existent ID.

More importantly, the payment endpoint needs to deduct from one balance and credit another atomically. PostgreSQL's `SELECT FOR UPDATE` row-level locking serialises concurrent payment requests at the database level.


### Why feature-style (vertical slice) architecture?

Each domain — `contracts`, `jobs`, `balances`, `admin`, `profiles` — owns its own model, repository, service, controller, and routes. This means:

- You can open `src/domain/jobs/` and see everything relevant to jobs in one place — model, business logic, HTTP handlers, validation, and barrel export.
- Easy to extract a feature into a separate service later without major refactoring, if decoupling into microservices..

Shared infrastructure that crosses domain boundaries — the `IdempotencyKey` model, `AuditLog` model, and their repositories — lives in `src/common/` and is imported from a single barrel: `import { IdempotencyKey, idempotencyRepository } from '../../common'`.

### Why `BIGINT` for money instead of `DECIMAL`?

Floating-point representation in JavaScript means `0.1 + 0.2 !== 0.3`. This is not theoretical — it has caused real financial bugs in production systems. Storing balances and prices as `BIGINT` (minor units / kobo) eliminates floating-point arithmetic entirely. The conversion to and from major units (₦) happens at a single explicit boundary in `src/utils/money.utils.ts` and `src/utils/serialize.utils.ts` — nowhere else.

### Why `sequelize.sync()` instead of migrations?

In production, I would never use sync() for schema changes, but for this assessment, migrations would shift significant time away from the work actually being evaluated. A production version of this codebase would replace `sync.ts` with a migrations folder and `sequelize-cli` commands.

### Authentication — a known shortcut

Authentication is implemented via the `profile_id` request header as the spec defines. This is not real authentication, any client can set any `profile_id` and impersonate any profile since there is no verification. In production this would be replaced with JWT: the client authenticates once, receives a signed token with the `profileId` in the payload, and subsequent requests carry it as `Authorization: Bearer <token>`. The middleware verifies the signature server-side and extracts the identity.

---

## 4. Stretch Goals — What I Picked and Why

**Idempotency (Option A) + Concurrency / Pessimistic Locking (Option B)**

> The two most immediate production risks for a payment endpoint are duplicate charges on network retries and corrupted balances under concurrent load. Idempotency prevents the former; pessimistic locking prevents the latter. Addressing both means the payment endpoint is safe even under retry storms and race conditions — which are the exact failure modes that cause the most damage in a payment system.

**Idempotency** — clients send an `Idempotency-Key` header (required on the payment endpoint). If the same key is seen again within 24 hours, the cached response is returned immediately without touching the database. This handles the case where the client sends a request, the payment succeeds server-side, but the response is dropped on the network — the client retries, gets the same success response, and no duplicate charge occurs.

**Pessimistic locking** — the payment endpoint wraps the entire transfer in a Sequelize managed transaction and acquires row-level locks (`SELECT FOR UPDATE`) on both the job row and the client profile row before reading or writing balances. Any concurrent request for the same job or profile blocks at the database level until the first transaction commits. No race condition is possible.

**Why pessimistic over optimistic locking?**

Optimistic locking assumes conflicts are rare and checks for them only at commit time, while pessimistic locking assumes conflicts are likely and prevents them upfront by locking data. For moving money around, pessmistic locking is better in my opinion.


**Rate limiting (Option C)** is also implemented — 100 requests/minute for general endpoints, 30/minute for analytics — because it costs almost nothing to add and protects the API from trivial abuse.

---

## 5. Payment Atomicity

The payment flow is fully atomic — either all of these happen or none of them do:

1. Job row is locked (`SELECT FOR UPDATE`) — prevents any concurrent payment on the same job
2. Client profile is locked (`SELECT FOR UPDATE`) — prevents balance being read stale under concurrent load
3. Job is verified as unpaid and owned by the authenticated client
4. Client balance is verified as sufficient
5. Client balance is decremented
6. Contractor balance is incremented
7. Job is marked as paid with `paymentDate`
8. Idempotency key is stored

If any step throws — insufficient balance, job already paid, wrong client — Sequelize rolls back the entire transaction. The database is never left in a partial state.

```
POST /jobs/:id/pay
  │
  ├── idempotencyCheck middleware
  │     ├── key missing → 400
  │     └── key exists + unexpired → return cached response (no DB write)
  │
  └── sequelize.transaction()
        ├── SELECT job FOR UPDATE
        ├── SELECT client profile FOR UPDATE  
        ├── validate: not paid, correct client, sufficient balance
        ├── decrement client balance
        ├── increment contractor balance
        ├── mark job paid
        ├── store idempotency key
        └── COMMIT (or ROLLBACK on any error)
```

---

## 6. The Scale Question

> *"If we get 10x more traffic tomorrow, what breaks first?"*

**1. `SELECT FOR UPDATE` row locks** become a bottleneck first. Payments on the same job/profile serialise at the DB level — under 10x load, the lock queue grows. This is an acceptable trade-off for correctness at current scale. At very high throughput, a fix is an event-sourcing approach or a per-job task queue (e.g. BullMQ) that processes payments sequentially without holding DB locks.

**2. In-memory rate limiter** breaks in a multi-process deployment. `express-rate-limit` stores state in memory — if we run 4 Node processes (PM2 cluster), each has its own counter. A client can make 400 requests/minute (100 × 4 processes) before being blocked. Fix: swap the store to Redis-backed (`rate-limit-redis`) so all processes share state.

**3. Connection pool exhaustion** — Sequelize's default pool max is 5. At 10x traffic that would not be optimal. Already set to `max: 20` in this codebase. Beyond that, we could add PgBouncer in front of Postgres for connection multiplexing.

**4. Idempotency table growth** — `expiresAt` does not auto-delete rows in Postgres (no native TTL like MongoDB). The table grows unbounded without a cleanup job. I would have a cron job to clean up the table at intervals.

---

## 7. Trade-offs & What I'd Do Differently

**With more time:**

- **Migrations over `sequelize.sync()`** — versioned, reversible schema changes are non-negotiable in production. `sequelize-cli` migrations would replace `sync.ts`.

- **JWT authentication** — the `profile_id` header approach is a spec requirement but not safe for production. A proper auth flow (login → signed JWT → middleware verification) would replace it.

- **Redis for rate limiting** — in-memory rate limiting doesn't survive a multi-process deployment. `rate-limit-redis` would be a small swap with a big correctness gain.

- **Read replica for analytics** — admin queries are expensive aggregations that don't need to run against the primary write database. A Postgres read replica would keep analytics load off the payment-critical path.

- **Pagination** on list endpoints — `GET /contracts` and `GET /jobs/unpaid` return all records. At scale, these need cursor or offset pagination.

- **Structured logging** — `console.log` is used throughout. In production this would be replaced with a structured logger (e.g. `pino`) that emits JSON logs with request IDs, making errors searchable in a log aggregator.


## 8. API Documentation

All endpoints require the `profile_id` header unless stated otherwise.

### Contracts

```bash
# Get a single contract (only if you are a participant)
curl -H 'profile_id: 1' \
  http://localhost:3001/contracts/1

# Get all active (non-terminated) contracts for your profile
curl -H 'profile_id: 1' \
  http://localhost:3001/contracts
```

### Jobs

```bash
# Get all unpaid jobs on active contracts for your profile
curl -H 'profile_id: 1' \
  http://localhost:3001/jobs/unpaid

# Pay for a job (Idempotency-Key is required)
curl -X POST \
  -H 'profile_id: 1' \
  -H 'Idempotency-Key: pay-job-1-attempt-1' \
  http://localhost:3001/jobs/1/pay
```

### Balances

```bash
# Deposit funds (capped at 25% of your total unpaid jobs)
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'profile_id: 1' \
  -d '{"amount": 100}' \
  http://localhost:3001/balances/deposit/1
```

### Admin Analytics

```bash
# Best earning profession in a date range
curl 'http://localhost:3001/admin/best-profession?start=2024-01-01&end=2024-12-31'

# Top paying clients in a date range (default limit: 2)
curl 'http://localhost:3001/admin/best-clients?start=2024-01-01&end=2024-12-31&limit=3'
```

### Response Shape

All responses follow a consistent envelope:

```json
// Success
{
  "status": "success",
  "message": "Payment completed successfully",
  "data": { "jobId": 1, "price": 200.00 }
}

// Error
{
  "status": "error",
  "error": {
    "name": "UNPROCESSABLE ENTITY",
    "code": 422,
    "message": "This job has already been paid"
  }
}

// Validation error (includes field-level details)
{
  "status": "error",
  "error": {
    "name": "BAD REQUEST",
    "code": 400,
    "message": "Validation failed",
    "details": {
      "body.amount": "Amount is required"
    }
  }
}
```

### Seed Data (for manual testing)

After running `npm run seed`:

| profile_id | Name | Type | Balance |
|---|---|---|---|
| 1 | Emeka Okafor | client | ₦1,500 |
| 2 | Aisha Bello | client | ₦500 |
| 3 | Tunde Adeyemi | contractor | ₦0 |

- Jobs 1 & 2 are unpaid under contract 1 (client 1 ↔ contractor 3) — use these to test payment
- Job 3 is already paid — use this to test double-payment rejection
- Contract 3 is terminated — use this to verify it is excluded from results

Database is already seeded for deployment.

See `src/db/seed.ts`
