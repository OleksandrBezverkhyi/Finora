# Business Logic

## User data isolation

All business operations are scoped to the authenticated user.
This rule is enforced on the server and is one of the most important invariants in the project.

Practical consequences:

- categories belong to one user
- transactions belong to one user
- a user cannot attach a transaction to another user's category
- analytics are calculated only from the current user's data

## Category rules

Each category has a `type`:

- `INCOME`
- `EXPENSE`

This distinction is not cosmetic. It affects how transactions are validated and how analytics
are calculated.

Important rule:

- a transaction can only reference a category with the same type

For example, an `EXPENSE` transaction cannot be linked to an `INCOME` category.

## Transaction rules

Transactions contain:

- type
- category
- amount
- date
- comment

Validation rules include:

- amount must be numeric and greater than zero
- category must exist
- category must belong to the current user
- category type must match transaction type
- comment is optional but length-limited

## Default currency behavior

The current product decision is to use Ukrainian hryvnia as the only active currency.
New users are assigned `UAH` by default, and interface formatters display monetary values using
the hryvnia symbol.

This reduces complexity in the MVP because:

- multi-currency exchange logic is not needed
- analytics stay consistent
- formatting rules remain simple and predictable

## Dashboard summary logic

The dashboard summary is based on a selected period:

- day
- week
- month
- custom

For the chosen period, the system calculates:

- total income
- total expenses
- balance = income - expenses
- top expense categories
- recent transactions

These values are derived from the same normalized date range so that all dashboard widgets remain
consistent with one another.

## Filtering algorithm in transactions

Transaction listing uses a combined filtering strategy.
The final Prisma `where` clause is built from:

- ownership by current user
- period or custom date range
- type
- category
- search query in comment or category name
- minimum amount
- maximum amount

This design centralizes filtering into one reusable helper, which prevents logic drift between the
API and future UI extensions.

## Pagination and sorting

Transactions are returned in pages with a fixed page size.
Sorting can be applied by:

- date ascending
- date descending
- amount ascending
- amount descending

Secondary sort keys are used to make ordering deterministic when primary values are equal.

## Summary aggregation algorithm

Dashboard analytics use aggregate and grouped database queries instead of loading all transactions
into memory. This decision was made to keep the implementation efficient and scalable.

The process is:

1. Resolve the date range.
2. Build a shared `where` clause.
3. Aggregate income totals.
4. Aggregate expense totals.
5. Group expense transactions by category.
6. Load only the latest transactions needed for the widget.

## Why these rules matter

These business rules ensure:

- correct ownership of financial data
- valid accounting semantics for income and expense records
- consistent analytics across the dashboard and history views
- predictable behavior for the user interface
