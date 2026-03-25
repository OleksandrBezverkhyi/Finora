import assert from "node:assert/strict";
import test from "node:test";

import { formatPeriodLabel, toDateInputValue } from "../../components/dashboard/dashboard-formatters.js";
import {
  createInitialFormState,
  getVisiblePages,
} from "../../components/transactions/transaction-utils.js";

test("createInitialFormState picks a category that matches the preferred type", () => {
  const categories = [
    { id: "salary", type: "INCOME" },
    { id: "groceries", type: "EXPENSE" },
  ];

  const state = createInitialFormState(categories, "EXPENSE");

  assert.equal(state.type, "EXPENSE");
  assert.equal(state.categoryId, "groceries");
  assert.equal(state.amount, "");
  assert.equal(state.comment, "");
  assert.match(state.date, /^\d{4}-\d{2}-\d{2}$/);
});

test("getVisiblePages returns a compact pagination window with edge pages included", () => {
  assert.deepEqual(getVisiblePages(4, 8), [1, 3, 4, 5, 8]);
});

test("dashboard formatters produce date input values and readable period labels", () => {
  assert.equal(toDateInputValue("2026-03-25T10:00:00.000Z"), "2026-03-25");

  const label = formatPeriodLabel({
    from: "2026-03-01T00:00:00.000Z",
    to: "2026-03-31T23:59:59.999Z",
  });

  assert.ok(label.includes("01.03.2026"));
  assert.ok(label.includes("31.03.2026"));
});
