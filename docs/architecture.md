# Architecture Overview

## Purpose

Finora is a web-oriented information system for personal income and expense tracking.
The application is designed around a simple but strict separation of concerns so that
authentication, business rules, persistence, and UI rendering remain maintainable as the
system grows.

## High-level architecture

The project follows a layered structure:

1. **Presentation layer**
   Implemented with Next.js App Router pages and reusable React components in `app/`
   and `components/`.
2. **Application layer**
   Implemented in API route handlers under `app/api/*`.
   This layer validates requests, checks authorization, and orchestrates use cases.
3. **Domain and business-logic layer**
   Implemented in `lib/*`.
   Shared logic such as summary calculation, transaction filtering, validation, and session
   handling lives here.
4. **Persistence layer**
   Implemented with Prisma and PostgreSQL through `lib/prisma.js` and `prisma/schema.prisma`.

## Main architectural decisions

### Next.js App Router

App Router was selected because it allows the project to combine:

- server-rendered pages for protected data
- colocated API routes
- clear separation between public and protected route groups

This is especially useful for a finance system where authenticated pages must be guarded
and initial data should be fetched on the server when possible.

### Server-first protected pages

Protected pages such as `/dashboard`, `/transactions`, and `/categories` load data on the server.
This reduces client-side bootstrapping complexity and keeps access control close to the entry point.

### Session-based data ownership

The client never sends `userId` to fetch private data.
Instead, the session is resolved on the server and all reads and writes are scoped to the
authenticated user. This avoids an entire class of insecure direct object reference issues.

### Shared domain helpers in `lib/*`

Complex query preparation and summary aggregation are extracted from route handlers into `lib/*`.
This keeps handlers small and makes business rules reusable, testable, and documentable.

## Data flow

The typical request flow is:

1. A user opens a protected page.
2. Middleware checks whether authentication is required.
3. The page or API route resolves the session.
4. Validation is executed with Zod where input exists.
5. Domain helpers build filters, date ranges, and aggregate queries.
6. Prisma reads or writes data in PostgreSQL.
7. The result is serialized and returned to the page or client component.

## Important modules

- `lib/auth.js`
  Central Auth.js configuration for credentials-based authentication.
- `lib/session.js`
  Shared helpers for obtaining or requiring the current session.
- `lib/validators.js`
  Input validation schemas for auth, categories, and transactions.
- `lib/transactions.js`
  Shared transaction filtering, sorting, pagination, and serialization logic.
- `lib/dashboard-summary.js`
  Summary aggregation logic for totals, top expense categories, and recent transactions.

## Scalability direction

The architecture is intentionally prepared for the next planned modules:

- budgets and savings goals
- import/export flows
- recommendations based on spending patterns
- extended analytics

These features can be added by extending the same pattern:
route handler -> validation -> domain helper -> Prisma query -> UI component.
