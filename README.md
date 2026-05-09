# Finora

Finora is a web-oriented personal finance tracker for income, expenses, analytics, budgeting, goals, recommendations, and CSV import/export.

## Tech Stack

- Next.js 16
- JavaScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Auth.js
- Zod
- Recharts
- Papa Parse

## Prerequisites

Before starting, make sure you have:

- Node.js 20+ and npm
- PostgreSQL 15+ (or a compatible local PostgreSQL instance)
- a valid `DATABASE_URL`
- an `AUTH_SECRET`

## Environment Setup

Create `.env.local` in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/finora?schema=public"
AUTH_SECRET="replace-this-with-a-secure-random-string"
```

Generate a secret, for example:

```bash
openssl rand -base64 32
```

## Install and Run

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Open:

```text
http://localhost:3000
```

## Database Commands

Generate Prisma Client:

```bash
npm run db:generate
```

Run development migrations:

```bash
npm run db:migrate
```

Open Prisma Studio:

```bash
npm run db:studio
```

## Seed Starter Categories

After you create at least one user, you can add starter categories:

```bash
npm run db:seed
```

This seed:

- finds existing users
- adds starter income categories
- adds starter expense categories
- skips duplicates safely

If you want to seed only one account:

```bash
SEED_USER_EMAIL="user@example.com" npm run db:seed
```

## Main Routes

- `/login`
- `/register`
- `/dashboard`
- `/transactions`
- `/categories`
- `/analytics`
- `/budgets`
- `/goals`
- `/profile`

## Quality Checks

Lint the project:

```bash
npm run lint
```

Format the project:

```bash
npm run format
```

## Manual Verification

Manual product checks are documented in:

- [docs/manual-checks.md](./docs/manual-checks.md)

These checks cover:

- auth flow
- categories
- transactions
- dashboard
- analytics
- budgets
- goals
- profile
- CSV import/export

## Project Notes

- Currency can be switched globally in the profile page.
- CSV import replaces the current transaction history with the uploaded file contents.
- Missing CSV categories are created automatically during import.
- The internal overall-expenses budget category is not shown in user-facing category lists.

## License

This project is licensed under the MIT License.

See [LICENSE](./LICENSE) for the full text.
