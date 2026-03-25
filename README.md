# Finora

Web-Oriented Information System for Personal Income and Expense Tracking

## Stack

- Next.js
- JavaScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM

## Run locally

```bash
npm install
npm run dev
```

## Code quality

```bash
npm run check
```

This command runs formatting validation, ESLint, and static type checking.
These checks are manual and run only when explicitly invoked.

## Documentation generation

The project uses **JSDoc** to generate documentation directly from documented source code.

To generate documentation:

```bash
npm run docs:generate
```

Generated HTML documentation is written to:

```bash
generated-docs/jsdoc
```

The generator configuration is stored in:

- `jsdoc.config.json`

Additional details are described in:

- `docs/jsdoc.md`
- `docs/generate_docs.md`

## Documentation quality

The project includes a dedicated documentation quality check:

```bash
npm run docs:check
```

This command verifies that:

- public exports are documented with JSDoc
- required project documentation files exist
- executable documentation tests are present

Executable documentation examples can be run with:

```bash
npm run docs:test
```

To run both documentation checks together:

```bash
npm run docs:verify
```

## Documentation rules

All contributors should follow the same documentation approach to keep the project consistent.

### What must be documented

- Key server utilities and business-logic functions in `lib/*`
- API route handlers with non-trivial validation, filtering, or data processing
- Reusable components with complex props or interaction logic
- Any new module, feature, or architectural change that affects how the system works

### How to document code

- Use `JSDoc` for important functions and methods
- Document:
  - purpose of the function
  - input parameters with `@param`
  - return value with `@returns`
  - important side effects such as redirects, database writes, or auth checks
- Add comments only where they provide useful context, not for obvious lines of code

### When documentation must be updated

- When adding a new feature
- When changing API behavior
- When changing validation rules
- When refactoring shared logic in `lib/*`
- When adding new scripts, tooling, or development workflows

### Project-level documentation

- Update `README.md` when setup, scripts, workflow, or contribution rules change
- Update files in `docs/` when linting, hooks, build checks, or other engineering processes change
- If a new module introduces its own conventions, document them in `docs/` as a separate file

### Technical documentation map

- `docs/architecture.md` describes the system structure and main technical decisions
- `docs/business-logic.md` describes domain rules and important algorithms
- `docs/component-interactions.md` describes how pages, components, hooks, and APIs work together
- `docs/test-driven-documentation.md` explains executable documentation through tests

### Expected standard for contributors

Before committing changes, make sure that:

1. New important functions are documented with JSDoc
2. Existing documentation is updated if behavior changed
3. Setup or workflow changes are reflected in `README.md`
4. Technical process changes are reflected in `docs/*`
