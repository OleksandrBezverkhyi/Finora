import assert from "node:assert/strict";
import test from "node:test";

import { categorySchema, registerSchema, transactionSchema } from "../../lib/validators.js";

test("registerSchema normalizes email, name, and default currency", () => {
  const result = registerSchema.parse({
    email: " User@Example.com ",
    password: "strongpass123",
    confirmPassword: "strongpass123",
    name: "  Oleksandr  ",
  });

  assert.deepEqual(result, {
    email: "user@example.com",
    password: "strongpass123",
    name: "Oleksandr",
    currency: "UAH",
  });
});

test("categorySchema normalizes optional color and preserves category type", () => {
  const result = categorySchema.parse({
    name: "Groceries",
    type: "EXPENSE",
    color: "#12abef",
  });

  assert.deepEqual(result, {
    name: "Groceries",
    type: "EXPENSE",
    color: "#12ABEF",
  });
});

test("transactionSchema coerces values into the normalized transaction payload", () => {
  const result = transactionSchema.parse({
    type: "INCOME",
    categoryId: "salary-category",
    amount: "25000.50",
    date: "2026-03-25",
    comment: "",
  });

  assert.equal(result.type, "INCOME");
  assert.equal(result.categoryId, "salary-category");
  assert.equal(result.amount, 25000.5);
  assert.equal(result.comment, null);
  assert.ok(result.date instanceof Date);
});
