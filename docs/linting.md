# Linting Documentation

## Chosen linter and reasons for selection

The project uses **ESLint** as the main linter because the application is written in
**JavaScript** and built with **Next.js** and **React**.

ESLint was selected for the following reasons:

- It is the standard static analysis tool for JavaScript projects.
- It integrates well with Next.js through `eslint-config-next`.
- It helps detect syntax issues, risky code patterns, and unused variables.
- It improves code consistency and maintainability during development.

In this project, the ESLint configuration is stored in
[eslint.config.mjs](../eslint.config.mjs).

## Basic rules and explanation

The project uses the `eslint-config-next/core-web-vitals` rule set. This gives a solid baseline
for code quality in a Next.js application and includes checks relevant to React and performance.

Additionally, the project defines a custom rule:

- `no-unused-vars: ["warn", { argsIgnorePattern: "^_" }]`
  This rule warns about unused variables, which helps keep the code clean.
  Function arguments that start with `_` are ignored, which is useful when a parameter must exist
  but is intentionally unused.

The project also uses **Prettier** for formatting. Its configuration is stored in
[.prettierrc](../.prettierrc).

Basic formatting rules include:

- `semi: true`  
  Statements must end with semicolons.
- `singleQuote: false`  
  Double quotes are used by default.
- `trailingComma: "es5"`  
  Trailing commas are added where supported by ES5.
- `printWidth: 100`  
  Long lines should be wrapped around 100 characters.

Ignored files and directories are configured in:

- [eslint.config.mjs](../eslint.config.mjs)
- [.prettierignore](../.prettierignore)

The npm scripts are defined in
[package.json](../package.json).

Examples of ignored paths:

- `.next/**`
- `build/**`
- `out/**`
- `node_modules/**`
- `coverage`
- `package-lock.json`

## How to run the linter

To run the linter in the project root, use:

```bash
npm run lint
```

This command executes:

```bash
eslint .
```

To automatically format files with Prettier, use:

```bash
npm run format
```

## Git hooks

The project uses **Husky**, but linting is not executed automatically in Git hooks.

The Git hook is stored in:

- [.husky/pre-commit](../.husky/pre-commit)

The hook is currently configured as a no-op so that code quality checks run only when the
developer explicitly starts them. This avoids unexpected lint execution during commits.

If dependencies have just been installed, the hooks are activated by:

```bash
npm run prepare
```

## Integration with the build process

Linting is not triggered automatically during the build process.

The `build` script runs:

```bash
next build
```

The combined manual verification command remains available:

```bash
npm run check
```

This command is useful when a full validation pass is needed locally or in CI.

## Static typing

Although the project is written in **JavaScript**, static type checking is enabled through
**TypeScript**.

The TypeScript configuration is stored in:

- [tsconfig.json](../tsconfig.json)

The configuration uses:

- `allowJs: true` to include JavaScript files
- `checkJs: true` to enable type analysis for JavaScript
- `noEmit: true` so that TypeScript only validates the code and does not generate output files

Static type checking is executed with:

```bash
npm run typecheck
```

This runs:

```bash
tsc --noEmit
```

As a result, the project now has an additional validation layer beyond linting and formatting.
