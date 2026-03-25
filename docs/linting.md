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
