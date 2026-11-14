# ADR-001: Select a JavaScript full-stack architecture

- **Status:** Accepted for the evaluation baseline
- **Date:** 2026-11-13

## Context

The product must be a real client-server application, use persistent relational storage, run locally through a single Docker Compose command, and remain explainable during a live code review.

## Decision

Use React + Vite for the browser client, Node.js + Express for the REST API, PostgreSQL for persistence, Prisma for schema/migrations, JWT + bcrypt for demo authentication, and Docker Compose for local orchestration.

## Consequences

**Positive:** one primary language across client/server; clear separation of concerns; relational integrity; repeatable migrations and seed data; simple local setup.

**Negative:** JavaScript type safety is weaker without TypeScript; JWT lifecycle needs production hardening; Compose images and npm dependencies must be cached before an offline demo; the stack still needs automated tests and concurrency controls.

## Alternatives considered

- Django + PostgreSQL: excellent batteries-included backend, but introduces Python alongside a JS frontend.
- Next.js + Prisma: integrated framework, but a separate Express API makes the API boundary and service deployment easier to demonstrate explicitly.
- Firebase: prototype references optional Firebase sync, but it introduces a hosted dependency and does not meet the no-Wi-Fi local evaluation goal as cleanly as local PostgreSQL.
