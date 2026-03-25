"use client";

import Link from "next/link";

const typeOptions = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
];

function FieldError({ error }) {
  if (!error) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-700">{error}</p>;
}

function TransactionFormHeader() {
  return (
    <div className="space-y-3">
      <p className="eyebrow">Add transaction</p>
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        Create income and expense records
      </h2>
      <p className="muted text-sm leading-6">
        Add each operation as soon as it happens to keep your balance and reports accurate.
      </p>
    </div>
  );
}

function TransactionEmptyState() {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] px-4 py-5">
      <p className="font-medium text-[var(--foreground)]">
        Add categories before creating your first transaction.
      </p>
      <p className="muted mt-2 text-sm leading-6">
        Start with a few categories for income and expenses, then come back here to record your
        operations.
      </p>
      <Link
        href="/categories"
        className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
      >
        Open categories
      </Link>
    </div>
  );
}

function TransactionFormFields({
  fieldErrors,
  formData,
  formError,
  formCategories,
  isSubmitting,
  onChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <TransactionPrimaryFields
        fieldErrors={fieldErrors}
        formCategories={formCategories}
        formData={formData}
        onChange={onChange}
      />
      <TransactionDetailFields fieldErrors={fieldErrors} formData={formData} onChange={onChange} />

      {formError ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !formCategories.length}
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Add transaction"}
      </button>
    </form>
  );
}

function TransactionPrimaryFields({ fieldErrors, formCategories, formData, onChange }) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Type
        </span>
        <select
          name="type"
          value={formData.type}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError error={fieldErrors.type?.[0]} />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Category
        </span>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        >
          {formCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError error={fieldErrors.categoryId?.[0]} />
      </label>
    </>
  );
}

function TransactionDetailFields({ fieldErrors, formData, onChange }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Amount, ₴
          </span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={formData.amount}
            onChange={onChange}
            placeholder="0.00"
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
          <FieldError error={fieldErrors.amount?.[0]} />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Date
          </span>
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={onChange}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
          <FieldError error={fieldErrors.date?.[0]} />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Comment
        </span>
        <textarea
          name="comment"
          rows="4"
          value={formData.comment}
          onChange={onChange}
          placeholder="Optional note"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
        <FieldError error={fieldErrors.comment?.[0]} />
      </label>
    </>
  );
}

/**
 * Transaction creation form used for adding new income and expense records.
 *
 * @param {{
 *   categories: Array<Record<string, unknown>>,
 *   fieldErrors: Record<string, string[]>,
 *   formData: Record<string, any>,
 *   formError: string,
 *   formCategories: Array<Record<string, unknown>>,
 *   isSubmitting: boolean,
 *   onChange: (event: Event) => void,
 *   onSubmit: (event: SubmitEvent) => Promise<void>
 * }} props
 * @returns {import("react").JSX.Element}
 */
export default function TransactionForm({
  categories,
  fieldErrors,
  formData,
  formError,
  formCategories,
  isSubmitting,
  onChange,
  onSubmit,
}) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
      <TransactionFormHeader />
      {categories.length === 0 ? (
        <TransactionEmptyState />
      ) : (
        <TransactionFormFields
          fieldErrors={fieldErrors}
          formData={formData}
          formError={formError}
          formCategories={formCategories}
          isSubmitting={isSubmitting}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )}
    </section>
  );
}
