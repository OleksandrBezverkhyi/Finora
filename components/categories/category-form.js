"use client";

function CategoryFieldError({ error }) {
  if (!error) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-700">{error}</p>;
}

function CategorySubmitButton({ editingId, isSubmitting }) {
  const label = isSubmitting
    ? editingId
      ? "Saving..."
      : "Creating..."
    : editingId
      ? "Save changes"
      : "Add category";

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {label}
    </button>
  );
}

function CategoryFormHeader({ editingId }) {
  return (
    <div className="space-y-3">
      <p className="eyebrow">{editingId ? "Edit category" : "Add category"}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        {editingId ? "Update current category" : "Create a new category"}
      </h2>
      <p className="muted text-sm leading-6">
        Use simple, recognizable category names so your reports and transaction history stay easy to
        read.
      </p>
    </div>
  );
}

function CategoryFormBody({
  editingId,
  fieldErrors,
  formData,
  formError,
  isSubmitting,
  onInputChange,
  onReset,
  onSubmit,
  typeOptions,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <CategoryBasicFields
        fieldErrors={fieldErrors}
        formData={formData}
        onInputChange={onInputChange}
        typeOptions={typeOptions}
      />
      <CategoryColorField
        color={formData.color}
        error={fieldErrors.color?.[0]}
        onInputChange={onInputChange}
      />

      {formError ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <CategorySubmitButton editingId={editingId} isSubmitting={isSubmitting} />
        {editingId ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            Cancel edit
          </button>
        ) : null}
      </div>
    </form>
  );
}

function CategoryBasicFields({ fieldErrors, formData, onInputChange, typeOptions }) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Name
        </span>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Groceries"
          required
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        />
        <CategoryFieldError error={fieldErrors.name?.[0]} />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Type
        </span>
        <select
          name="type"
          value={formData.type}
          onChange={onInputChange}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CategoryFieldError error={fieldErrors.type?.[0]} />
      </label>
    </>
  );
}

function CategoryColorField({ color, error, onInputChange }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        Color
      </span>
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
        <input
          name="color"
          type="color"
          value={color}
          onChange={onInputChange}
          className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent"
        />
        <span className="font-mono text-sm text-[var(--foreground)]/70">{color}</span>
      </div>
      <CategoryFieldError error={error} />
    </label>
  );
}

export default function CategoryForm({
  editingId,
  formData,
  fieldErrors,
  formError,
  isSubmitting,
  typeOptions,
  onInputChange,
  onSubmit,
  onReset,
}) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
      <CategoryFormHeader editingId={editingId} />
      <CategoryFormBody
        editingId={editingId}
        fieldErrors={fieldErrors}
        formData={formData}
        formError={formError}
        isSubmitting={isSubmitting}
        onInputChange={onInputChange}
        onReset={onReset}
        onSubmit={onSubmit}
        typeOptions={typeOptions}
      />
    </section>
  );
}
