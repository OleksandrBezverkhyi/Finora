"use client";

import { useMemo, useState } from "react";

import { useLocale } from "@/components/common/locale-provider";

const initialForm = { name: "", type: "EXPENSE", color: "#0F766E" };
const initialErrors = { name: [], type: [], color: [] };

export default function CategoriesManager({ initialCategories }) {
  const { messages, translateErrorMessage } = useLocale();
  const typeOptions = useMemo(
    () => [
      { value: "EXPENSE", label: messages.common.expense },
      { value: "INCOME", label: messages.common.income },
    ],
    [messages]
  );
  const [categories, setCategories] = useState(initialCategories);
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialErrors);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const groupedCategories = {
    EXPENSE: categories.filter((category) => category.type === "EXPENSE"),
    INCOME: categories.filter((category) => category.type === "INCOME"),
  };

  function resetForm() {
    setFormData(initialForm);
    setFieldErrors(initialErrors);
    setFormError("");
    setEditingId(null);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialErrors);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({
            ...initialErrors,
            ...Object.fromEntries(
              Object.entries(data.issues.fieldErrors).map(([key, value]) => [key, value.map((item) => translateErrorMessage(item))])
            ),
          });
          setFormError(translateErrorMessage(data.issues.formErrors?.[0] || ""));
          return;
        }
        setFormError(translateErrorMessage(data.error || "Unable to save category right now."));
        return;
      }

      const savedCategory = data.category;
      setCategories((current) =>
        (editingId
          ? current.map((category) => (category.id === savedCategory.id ? savedCategory : category))
          : [...current, savedCategory]
        ).sort(sortCategories)
      );
      resetForm();
    } catch {
      setFormError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setFieldErrors(initialErrors);
    setFormError("");
    setFormData({ name: category.name, type: category.type, color: category.color || initialForm.color });
  }

  async function handleDelete(categoryId) {
    setDeletingId(categoryId);
    setFormError("");

    try {
      const response = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setFormError(translateErrorMessage(data.error || "Unable to delete category right now."));
        return;
      }
      setCategories((current) => current.filter((category) => category.id !== categoryId));
      if (editingId === categoryId) resetForm();
    } catch {
      setFormError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setDeletingId(null);
    }
  }

  function renderFieldError(fieldName) {
    const error = fieldErrors[fieldName]?.[0];
    if (!error) return null;
    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="space-y-3">
          <p className="eyebrow">{editingId ? messages.categories.editEyebrow : messages.categories.addEyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{editingId ? messages.categories.editTitle : messages.categories.addTitle}</h2>
          <p className="muted text-sm leading-6">{messages.categories.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.categories.name}</span>
            <input name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder={messages.categories.placeholder} required className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" />
            {renderFieldError("name")}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.categories.type}</span>
            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]">
              {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {renderFieldError("type")}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.categories.color}</span>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
              <input name="color" type="color" value={formData.color} onChange={handleInputChange} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent" />
              <span className="font-mono text-sm text-[var(--foreground)]/70">{formData.color}</span>
            </div>
            {renderFieldError("color")}
          </label>

          {formError ? <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">{formError}</div> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={isSubmitting} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? (editingId ? messages.categories.saving : messages.categories.creating) : editingId ? messages.common.saveChanges : messages.categories.create}
            </button>
            {editingId ? <button type="button" onClick={resetForm} className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">{messages.common.cancelEdit}</button> : null}
          </div>
        </form>
      </section>

      <section className="space-y-5">
        {typeOptions.map((section) => (
          <div key={section.value} className="glass-panel rounded-[1.75rem] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{section.label}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{section.value === "EXPENSE" ? messages.categories.expenseCategories : messages.categories.incomeCategories}</h3>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-sm font-medium text-[var(--muted)]">{groupedCategories[section.value].length}</span>
            </div>

            <div className="mt-6 space-y-3">
              {groupedCategories[section.value].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">{messages.categories.empty}</div>
              ) : (
                groupedCategories[section.value].map((category) => (
                  <article key={category.id} className="rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-full border border-black/5" style={{ backgroundColor: category.color || "#0F766E" }} />
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{category.name}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">{category.color || messages.categories.standardColor}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleEdit(category)} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">{messages.common.edit}</button>
                        <button type="button" onClick={() => handleDelete(category.id)} disabled={deletingId === category.id} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70">{deletingId === category.id ? messages.common.deleting : messages.common.delete}</button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function sortCategories(left, right) {
  if (left.type !== right.type) return left.type.localeCompare(right.type);
  return left.name.localeCompare(right.name);
}
