# Test-Driven Documentation

## Purpose

This project uses executable tests as a form of documentation for important utility behavior.
These tests do not replace interface documentation, but they show concrete examples of how core
helpers are expected to behave.

## What is documented through tests

The documentation tests currently focus on:

- validation schemas in `lib/validators.js`
- formatting and pagination helpers in `components/*/utils`

These areas were selected because they contain reusable logic with clear inputs and outputs.

## Why this is useful

Test-driven documentation helps contributors understand:

- which inputs are valid
- how data is normalized
- what output shape is expected
- which edge cases are intentionally supported

Unlike prose-only documentation, these examples are executable and can detect regressions.

## How to run documentation tests

Run:

```bash
npm run docs:test
```

This command executes the example-based tests from:

```bash
tests/documentation
```

## How to extend

When a new reusable helper or important business rule is added:

1. Document its interface with JSDoc.
2. Add or update prose documentation in `docs/` if the behavior affects architecture or rules.
3. Add at least one documentation test that demonstrates real expected usage.

## Recommended style for documentation tests

- keep each test focused on one usage scenario
- use descriptive test names that read like examples
- prefer business-relevant behavior over low-level implementation details
- avoid coupling tests to fragile UI markup unless the UI itself is the documented contract
