# JSDoc Configuration

## Tool

The project uses **JSDoc** to generate API-style documentation directly from source code comments.

## Purpose

JSDoc is configured to:

- read documentation comments from the project source code
- generate HTML documentation automatically
- provide a single command for rebuilding developer documentation

## Configuration file

The generator is configured in:

- [jsdoc.config.json](../jsdoc.config.json)

## Source directories

JSDoc scans the following parts of the project:

- `app/`
- `components/`
- `lib/`
- `middleware.js`

Generated output is written to:

- `generated-docs/jsdoc/`

This directory is ignored by Git because it is build output.

## Command

To generate documentation, run:

```bash
npm run docs:generate
```

This command executes:

```bash
jsdoc -c jsdoc.config.json
```

## Documentation standard

When documenting code, contributors should use JSDoc comments for:

- important functions
- shared utilities
- business logic
- API-related helpers

Each documented function should include:

- a short description
- `@param` for input arguments
- `@returns` for the returned value
- side effects when relevant
