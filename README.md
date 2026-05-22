# LedgerFlow

**LedgerFlow** is an event-driven payment reconciliation and audit ledger system built with Node.js, Express, PostgreSQL, Prisma, Redis, BullMQ, and TypeScript.

It simulates how fintech platforms receive payment provider webhooks, protect against duplicate events, process payments asynchronously, create double-entry ledger records, and reconcile internal transactions against provider settlement records.

---

## Why This Project Exists

Payment systems are not just about accepting money.

Real backend systems must also handle:

- Duplicate webhooks
- Failed background jobs
- Payment status tracking
- Financial ledger accuracy
- Provider settlement mismatches
- Audit trails
- Reconciliation reports
- Operational metrics

LedgerFlow was built to demonstrate these backend engineering concerns in a realistic fintech-style architecture.

---

## Architecture

See the full system design here:

[View Architecture](docs/ARCHITECTURE.md)

---

## Core Features

- Payment webhook ingestion
- API key protected webhook endpoint
- Idempotency protection
- Redis + BullMQ background processing
- Payment event state machine
- Double-entry ledger creation
- Provider settlement records
- Bulk settlement import
- Reconciliation engine
- Reconciliation reports
- Queue metrics
- System metrics
- Audit logs
- Rate limiting

---

## Tech Stack

| Area | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Primary Database | PostgreSQL |
| ORM | Prisma |
| Queue | BullMQ |
| Queue Store | Redis |
| Security | API Keys, Rate Limiting, Helmet |
| Logging | Morgan |
| Container Support | Docker for Redis |

---

## High-Level Flow

```txt
Payment Provider
    ↓
Webhook API
    ↓
API Key Auth + Rate Limiting
    ↓
Idempotency Check
    ↓
PaymentEvent saved in PostgreSQL
    ↓
BullMQ job added
    ↓
Worker creates double-entry ledger
    ↓
Settlement records imported
    ↓
Reconciliation engine detects matches/mismatches
    ↓
Audit logs + reports + metrics
```

---

## Payment Event Lifecycle

```txt
RECEIVED → QUEUED → PROCESSING → PROCESSED
```

Failure path:

```txt
PROCESSING → FAILED
```

## Load Testing

LedgerFlow was load-tested using a custom simulation script that generated 5,000+ payment reconciliation events through the full processing pipeline.

### Results

- 5,000+ simulated payment events processed
- 99.98% processing success rate
- Redis + BullMQ asynchronous queue processing
- PostgreSQL persistence and ledger creation
- Real-time queue metrics and audit logging

Example queue metrics:

```json
{
  "totalPaymentEvents": 6598,
  "totalProcessedJobs": 6597,
  "successRate": 99.98
}
```

---

## Main Endpoints

### Health Check

Checks whether the API is running.

```txt
GET /health
```

---

### Database Test

Checks whether Node.js can talk to PostgreSQL through Prisma.

```txt
GET /api/test/db
```

---

### Create API Key

Creates an API key for a simulated client/provider.

```txt
POST /api/api-keys
```

Body:

```json
{
  "name": "Test Client"
}
```

---

### Paystack Webhook

Receives a fake Paystack payment webhook, saves the payment event, and queues it for background ledger processing.

Requires header:

```txt
x-api-key: YOUR_API_KEY
```

```txt
POST /api/webhooks/paystack
```

Body:

```json
{
  "eventId": "evt_paystack_001",
  "transactionRef": "TXN-LEDGER-001",
  "amount": 5000,
  "currency": "GBP",
  "customerEmail": "customer@example.com",
  "status": "success"
}
```

---

### Get Payment Events

Returns all payment events.

```txt
GET /api/payment-events
```

---

### Get Ledger Entries

Returns all double-entry ledger records.

```txt
GET /api/ledger
```

---

### Get Ledger Summary

Checks whether total credits and debits are balanced.

```txt
GET /api/ledger/summary
```

---

### Create Settlement Record

Creates one provider settlement record manually.

```txt
POST /api/settlements
```

Body:

```json
{
  "provider": "PAYSTACK",
  "providerTransactionId": "settle_paystack_001",
  "transactionRef": "TXN-LEDGER-001",
  "amount": 5000,
  "currency": "GBP",
  "settledAt": "2026-05-01T10:00:00.000Z"
}
```

---

### Bulk Settlement Import

Simulates importing many provider settlement records from a CSV-style source.

```txt
POST /api/settlements/bulk
```

---

### Reconcile One Settlement

Compares one settlement record against the internal ledger.

```txt
POST /api/reconciliation/:settlementId
```

---

### Reconcile All Pending Settlements

Runs reconciliation for all settlement records still marked as pending.

```txt
POST /api/reconciliation/run-pending
```

---

### Reconciliation Report

Returns a dashboard-style reconciliation report.

```txt
GET /api/reconciliation/report
```

---

### Queue Stats

Shows BullMQ job counts.

```txt
GET /api/queues/payment/stats
```

---

### Failed Jobs

Shows failed queue jobs for debugging.

```txt
GET /api/queues/payment/failed
```

---

### System Metrics

Returns high-level system metrics including success rate.

```txt
GET /api/metrics
```

---

### Audit Logs

Returns system audit logs.

```txt
GET /api/audit-logs
```

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

---

### 2. Start Redis with Docker

```bash
docker run --name ledgerflow-redis -p 6379:6379 -d redis
```

If the container already exists:

```bash
docker start ledgerflow-redis
```

---

### 3. Configure environment variables

Create `.env`:

```env
PORT=5700
NODE_ENV=development

DATABASE_URL="postgresql://postgres:12345@localhost:5432/ledgerflow"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

### 4. Run Prisma migration

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

### 5. Start development server

```bash
npm run dev
```

API runs on:

```txt
http://localhost:5700
```

---

## Example Test Flow

1. Create an API key
2. Send a Paystack webhook using `x-api-key`
3. Check payment events
4. Check queue stats
5. Check ledger entries
6. Create settlement records
7. Run reconciliation
8. View reconciliation report
9. View audit logs
10. View system metrics

---

## Engineering Concepts Demonstrated

LedgerFlow demonstrates backend concepts expected in real production systems:

- Event-driven architecture
- Queue-based processing
- Idempotency
- Double-entry accounting logic
- Database transactions
- Reconciliation workflows
- State machines
- API key authentication
- Rate limiting
- Audit logging
- Operational metrics
- Failure recovery
- Multi-step backend workflows

---

## Portfolio Positioning

This project demonstrates how financial backend systems can be designed to safely process payment events, prevent duplicate processing, maintain balanced ledger records, and detect settlement mismatches.

It is designed as a backend-heavy engineering project for demonstrating system design, reliability, and distributed processing skills.