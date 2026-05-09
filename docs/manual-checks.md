# Manual Checks

These checks cover the main product flow before a demo, final commit, or release candidate.

## Environment

1. Ensure PostgreSQL is running.
2. Ensure `.env.local` contains a valid `DATABASE_URL` and `AUTH_SECRET`.
3. Run:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Authentication

1. Open `http://localhost:3000`.
2. Confirm the app redirects to `/login`.
3. Register a new user.
4. Log in with the new account.
5. Confirm `/dashboard` opens successfully.
6. Use `Sign out` and confirm the app returns to `/login`.

## Categories

1. Open `/categories`.
2. Create at least one expense category and one income category.
3. Edit a category and confirm the changes persist.
4. Delete an unused category and confirm it disappears.
5. Try deleting a category with related budgets and confirm the confirmation modal appears.

## Transactions

1. Open `/transactions`.
2. Add several income and expense transactions with comments.
3. Confirm the new rows appear in history.
4. Edit a transaction and confirm the form scrolls into view and the changes persist.
5. Delete a transaction and confirm it disappears from history.
6. Test filters by period, type, category, search text, and amount range.

## Dashboard

1. Open `/dashboard`.
2. Confirm summary cards show income, expense, and balance.
3. Test period switching for `Day`, `Week`, `Month`, `All time`, and `Custom`.
4. Use the previous/next arrows for `Day`, `Week`, and `Month`.
5. Confirm the right arrow stops at the current calendar period.
6. Verify recent transactions and alerts update with the selected period.

## Analytics

1. Open `/analytics`.
2. Confirm the page loads without runtime errors.
3. Test `Day`, `Week`, `Month`, `All time`, and `Custom`.
4. Verify the line chart, expense structure, and compare card refresh together.
5. Use the compact category list toggle in `Expense structure`.

## Budgets

1. Open `/budgets`.
2. Create a monthly limit for an expense category.
3. Create an `Overall expenses` limit.
4. Confirm progress updates after adding expense transactions.
5. Edit and delete a budget.

## Goals

1. Open `/goals`.
2. Create a savings goal with a target date.
3. Confirm progress, remaining amount, and recommended pace are shown.
4. Edit the goal and confirm changes persist.
5. Verify archived goals look visually distinct.

## Profile and CSV

1. Open `/profile`.
2. Update the user name and save.
3. Change the base currency and confirm amounts update across the app.
4. Change the password using the current password.
5. Export transactions to CSV.
6. Preview a CSV import and confirm validation messages appear under affected rows.
7. Import a valid CSV and confirm transactions are replaced with the file contents.

## Final Quality Checks

Run:

```bash
npm run lint
```

Optional database inspection:

```bash
npm run db:studio
```
