# Component Interactions

## Public vs protected application areas

The interface is split into two route groups:

- public pages: login and registration
- protected pages: dashboard, categories, transactions

This separation keeps authentication-related UI independent from the main product shell.

## Authentication flow

The authentication flow works as follows:

1. A visitor opens `/login` or `/register`.
2. Public pages render form components from `components/auth/*`.
3. Registration submits data to `POST /api/auth/register`.
4. Login is handled by Auth.js credentials flow.
5. Middleware redirects authenticated users away from auth pages and unauthenticated users away
   from protected pages.

## Dashboard interaction flow

The dashboard page loads initial summary data on the server.
After the first render:

- `DashboardOverview` controls the selected period
- `useDashboardSummary` requests updated summary data from `/api/analytics/summary`
- summary cards, top categories, and recent transactions re-render from the same response

This ensures all dashboard widgets remain synchronized to one selected period.

## Categories interaction flow

The categories page works through one stateful manager component:

1. Server page loads initial categories.
2. `CategoriesManager` passes them into `useCategoriesManager`.
3. The hook manages form state, editing mode, and deletion state.
4. Create, update, and delete actions call `/api/categories` endpoints.
5. The grouped list re-renders after each successful operation.

The design keeps mutation logic in the hook and rendering logic in smaller view components.

## Transactions interaction flow

The transactions page combines three UI responsibilities:

- creating a transaction
- filtering transaction history
- viewing paginated results

The flow is:

1. The server page loads categories, initial transactions, and pagination metadata.
2. `TransactionsManager` initializes client state through `useTransactionsManager`.
3. The form submits new transactions to `POST /api/transactions`.
4. Filters rebuild the query string and reload the list through `GET /api/transactions`.
5. The history table consumes the shared pagination state and allows page navigation.

## Interaction between API and shared logic

Route handlers do not implement all logic inline.
Instead, they depend on shared helpers:

- `lib/validators.js` for request validation
- `lib/session.js` for current-user resolution
- `lib/transactions.js` for filter and pagination logic
- `lib/dashboard-summary.js` for analytics aggregation

This keeps responsibilities clear:

- API routes orchestrate
- `lib/*` modules decide how the business logic works
- components focus on rendering and interaction

## Hard-to-understand areas

The most important interaction-heavy parts are:

- transaction filter composition
- dashboard period synchronization
- category ownership and transaction-category type consistency

These areas are documented both in source comments and in dedicated documentation files because
they affect correctness rather than only presentation.
