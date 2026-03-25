"use client";

function CategoryEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
      You have not added any categories in this section yet.
    </div>
  );
}

function CategoryCard({ category, deletingId, onDelete, onEdit }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 rounded-full border border-black/5"
            style={{ backgroundColor: category.color || "#0F766E" }}
          />
          <div>
            <p className="font-semibold text-[var(--foreground)]">{category.name}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {category.color || "Standard category color"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(category.id)}
            disabled={deletingId === category.id}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deletingId === category.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function CategorySection({ categories, deletingId, label, onDelete, onEdit }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{label}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {label} categories
          </h3>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-sm font-medium text-[var(--muted)]">
          {categories.length}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {categories.length === 0 ? (
          <CategoryEmptyState />
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              deletingId={deletingId}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Displays grouped category lists with edit and delete actions for each category type.
 *
 * @param {{
 *   deletingId: string | null,
 *   groupedCategories: Record<string, Array<Record<string, unknown>>>,
 *   typeOptions: Array<{ value: string, label: string }>,
 *   onDelete: (categoryId: string) => void,
 *   onEdit: (category: Record<string, unknown>) => void
 * }} props
 * @returns {import("react").JSX.Element}
 */
export default function CategorySections({
  deletingId,
  groupedCategories,
  typeOptions,
  onDelete,
  onEdit,
}) {
  return (
    <section className="space-y-5">
      {typeOptions.map((section) => (
        <CategorySection
          key={section.value}
          categories={groupedCategories[section.value]}
          deletingId={deletingId}
          label={section.label}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </section>
  );
}
