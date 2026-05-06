"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import DayFirstDateInput from "@/components/common/day-first-date-input";
import { useLocale } from "@/components/common/locale-provider";
import { formatDateLocalized, formatMoneyLocalized, interpolate } from "@/lib/i18n";

const initialFilterState = { period: "", from: "", to: "", type: "", categoryId: "", q: "", min: "", max: "", sort: "date_desc" };
const initialFieldErrors = { type: [], categoryId: [], amount: [], date: [], comment: [] };

export default function TransactionsManager({ categories, initialTransactions, initialPagination }) {
  const { locale, messages, translateErrorMessage } = useLocale();
  const periodOptions = useMemo(
    () => [
      { value: "", label: messages.common.allTime },
      { value: "day", label: messages.common.today },
      { value: "week", label: messages.common.thisWeek },
      { value: "month", label: messages.common.thisMonth },
      { value: "custom", label: messages.common.customRange },
    ],
    [messages]
  );
  const typeOptions = useMemo(
    () => [
      { value: "", label: messages.common.allTypes },
      { value: "EXPENSE", label: messages.common.expense },
      { value: "INCOME", label: messages.common.income },
    ],
    [messages]
  );
  const sortOptions = useMemo(
    () => [
      { value: "date_desc", label: messages.transactions.sortDateDesc },
      { value: "date_asc", label: messages.transactions.sortDateAsc },
      { value: "amount_desc", label: messages.transactions.sortAmountDesc },
      { value: "amount_asc", label: messages.transactions.sortAmountAsc },
    ],
    [messages]
  );
  const [transactions, setTransactions] = useState(initialTransactions);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(initialFilterState);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState(() => createInitialFormState(categories, initialTransactions[0]?.type));

  const formCategories = categories.filter((category) => category.type === formData.type);
  const filterCategories = filters.type ? categories.filter((category) => category.type === filters.type) : categories;

  async function fetchTransactions(nextPage = 1, nextFilters = filters) {
    setIsLoading(true);
    setListError("");
    try {
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (!value) return;
        if ((key === "from" || key === "to") && nextFilters.period !== "custom") return;
        params.set(key, value);
      });
      params.set("page", String(nextPage));
      const response = await fetch(`/api/transactions?${params.toString()}`, { method: "GET" });
      const data = await response.json();
      if (!response.ok) {
        setListError(translateErrorMessage(data.error || "Unable to load transactions right now."));
        return;
      }
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch {
      setListError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setFormData(createInitialFormState(categories, formData.type));
    setFormError("");
    setFieldErrors(initialFieldErrors);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialFieldErrors);
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/transactions/${editingId}` : "/api/transactions";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: Number(formData.amount) }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({
            ...initialFieldErrors,
            ...Object.fromEntries(Object.entries(data.issues.fieldErrors).map(([key, value]) => [key, value.map((item) => translateErrorMessage(item))])),
          });
          setFormError(translateErrorMessage(data.issues.formErrors?.[0] || ""));
          return;
        }
        setFormError(translateErrorMessage(data.error || "Unable to save transaction right now."));
        return;
      }
      resetForm();
      await fetchTransactions(editingId ? pagination.page : 1, filters);
    } catch {
      setFormError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id);
    setFormError("");
    setFieldErrors(initialFieldErrors);
    setFormData({ type: transaction.type, categoryId: transaction.category.id, amount: transaction.amount, date: formatDateInput(new Date(transaction.date)), comment: transaction.comment || "" });
  }

  async function handleDelete(transactionId) {
    setDeletingId(transactionId);
    setListError("");
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setListError(translateErrorMessage(data.error || "Unable to delete transaction right now."));
        return;
      }
      if (editingId === transactionId) resetForm();
      await fetchTransactions(pagination.page, filters);
    } catch {
      setListError(translateErrorMessage("Unexpected error. Please try again."));
    } finally {
      setDeletingId(null);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    if (name === "type") {
      const nextCategory = categories.find((category) => category.type === value);
      setFormData((current) => ({ ...current, type: value, categoryId: nextCategory?.id || "" }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => {
      const next = { ...current, [name]: value };
      if (name === "period" && value !== "custom") {
        next.from = "";
        next.to = "";
      }
      if (name === "type") {
        const categoryStillValid = categories.some((category) => category.id === current.categoryId && (!value || category.type === value));
        if (!categoryStillValid) next.categoryId = "";
      }
      return next;
    });
  }

  function renderFieldError(fieldName) {
    const error = fieldErrors[fieldName]?.[0];
    if (!error) return null;
    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="space-y-3">
            <p className="eyebrow">{editingId ? messages.transactions.editEyebrow : messages.transactions.addEyebrow}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{editingId ? messages.transactions.editTitle : messages.transactions.addTitle}</h2>
            <p className="muted text-sm leading-6">{messages.transactions.addDescription}</p>
          </div>

          {categories.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] px-4 py-5">
              <p className="font-medium text-[var(--foreground)]">{messages.transactions.addCategoriesFirst}</p>
              <p className="muted mt-2 text-sm leading-6">{messages.transactions.addCategoriesFirstText}</p>
              <Link href="/categories" className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--accent-strong)] hover:!text-white focus:!text-white visited:!text-white" style={{ color: "#ffffff" }}>{messages.transactions.openCategories}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.type}</span><select name="type" value={formData.type} onChange={handleFormChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]">{typeOptions.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{renderFieldError("type")}</label>
              <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.category}</span><select name="categoryId" value={formData.categoryId} onChange={handleFormChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]">{formCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{renderFieldError("categoryId")}</label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.transactions.amountLabel}</span><input name="amount" type="number" min="0" step="0.01" inputMode="decimal" value={formData.amount} onChange={handleFormChange} placeholder="0.00" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" />{renderFieldError("amount")}</label>
                <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.date}</span><DayFirstDateInput name="date" value={formData.date} onChange={handleFormChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" />{renderFieldError("date")}</label>
              </div>
              <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.comment}</span><textarea name="comment" rows="4" value={formData.comment} onChange={handleFormChange} placeholder={messages.transactions.optionalNote} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" />{renderFieldError("comment")}</label>
              {formError ? <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">{formError}</div> : null}
              <div className="flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={isSubmitting || !formCategories.length} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? (editingId ? messages.categories.saving : messages.categories.creating) : editingId ? messages.common.saveChanges : messages.transactions.add}</button>{editingId ? <button type="button" onClick={resetForm} className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">{messages.common.cancelEdit}</button> : null}</div>
            </form>
          )}
        </section>

        <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="space-y-3">
            <p className="eyebrow">{messages.common.filters}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{messages.transactions.filtersTitle}</h2>
            <p className="muted text-sm leading-6">{messages.transactions.filtersDescription}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.transactions.period}</span><select name="period" value={filters.period} onChange={handleFilterChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]">{periodOptions.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></label>
            <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.type}</span><select name="type" value={filters.type} onChange={handleFilterChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]">{typeOptions.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}</select></label>
            {filters.period === "custom" ? <><label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.from}</span><DayFirstDateInput name="from" value={filters.from} onChange={handleFilterChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" /></label><label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.to}</span><DayFirstDateInput name="to" value={filters.to} onChange={handleFilterChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" /></label></> : null}
            <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.category}</span><select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"><option value="">{messages.common.allCategories}</option>{filterCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.search}</span><input name="q" type="text" value={filters.q} onChange={handleFilterChange} placeholder={messages.transactions.commentOrCategory} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" /></label>
            <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.transactions.minAmount}</span><input name="min" type="number" min="0" step="0.01" value={filters.min} onChange={handleFilterChange} placeholder="0.00" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" /></label>
            <label className="block space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.transactions.maxAmount}</span><input name="max" type="number" min="0" step="0.01" value={filters.max} onChange={handleFilterChange} placeholder="0.00" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]" /></label>
            <label className="block space-y-2 md:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{messages.common.sort}</span><select name="sort" value={filters.sort} onChange={handleFilterChange} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]">{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => fetchTransactions(1, filters)} disabled={isLoading} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70">{isLoading ? messages.common.loading : messages.transactions.applyFilters}</button><button type="button" onClick={async () => { setFilters(initialFilterState); await fetchTransactions(1, initialFilterState); }} disabled={isLoading} className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70">{messages.transactions.reset}</button></div>
        </section>
      </div>

      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.common.history}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{messages.transactions.historyTitle}</h2>
            <p className="muted text-sm leading-6">{interpolate(messages.transactions.historyDescription, { page: pagination.page, totalPages: pagination.totalPages, total: pagination.total })}</p>
          </div>
          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">{isLoading ? messages.common.refreshing : interpolate(messages.transactions.totalVisible, { count: transactions.length })}</div>
        </div>

        {listError ? <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">{listError}</div> : null}

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead><tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"><th className="px-4 py-2">{messages.common.date}</th><th className="px-4 py-2">{messages.common.type}</th><th className="px-4 py-2">{messages.common.category}</th><th className="px-4 py-2">{messages.common.comment}</th><th className="px-4 py-2">{messages.common.amount}</th><th className="px-4 py-2">{messages.transactions.actions}</th></tr></thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="6" className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">{messages.transactions.noMatches}</td></tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="rounded-2xl bg-white/75 shadow-[0_8px_24px_rgba(68,53,31,0.06)]">
                    <td className="rounded-l-2xl px-4 py-4 text-sm text-[var(--foreground)]">{formatDateLocalized(transaction.date, locale)}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${transaction.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{transaction.type === "INCOME" ? messages.common.income : messages.common.expense}</span></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><span className="h-3.5 w-3.5 rounded-full border border-black/5" style={{ backgroundColor: transaction.category.color || "#0F766E" }} /><span className="font-medium text-[var(--foreground)]">{transaction.category.name}</span></div></td>
                    <td className="px-4 py-4 text-sm text-[var(--muted)]">{transaction.comment || messages.common.noComment}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-[var(--foreground)]">{formatMoneyLocalized(transaction.amount, locale)}</td>
                    <td className="rounded-r-2xl px-4 py-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => handleEdit(transaction)} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">{messages.common.edit}</button><button type="button" onClick={() => handleDelete(transaction.id)} disabled={deletingId === transaction.id} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70">{deletingId === transaction.id ? messages.common.deleting : messages.common.delete}</button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">{interpolate(messages.transactions.pageOf, { page: pagination.page, totalPages: pagination.totalPages })}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fetchTransactions(pagination.page - 1)} disabled={pagination.page <= 1 || isLoading} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50">{messages.common.previous}</button>
            {getVisiblePages(pagination.page, pagination.totalPages).map((pageNumber) => <button key={pageNumber} type="button" onClick={() => fetchTransactions(pageNumber)} disabled={isLoading} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${pageNumber === pagination.page ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"}`}>{pageNumber}</button>)}
            <button type="button" onClick={() => fetchTransactions(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || isLoading} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50">{messages.common.next}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function createInitialFormState(categories, preferredType = "EXPENSE") { const nextType = categories.some((category) => category.type === preferredType) ? preferredType : "INCOME"; const nextCategory = categories.find((category) => category.type === nextType) || categories[0]; return { type: nextCategory?.type || "EXPENSE", categoryId: nextCategory?.id || "", amount: "", date: formatDateInput(new Date()), comment: "" }; }
function formatDateInput(date) { const offset = date.getTimezoneOffset(); const localDate = new Date(date.getTime() - offset * 60_000); return localDate.toISOString().slice(0, 10); }
function getVisiblePages(currentPage, totalPages) { const start = Math.max(1, currentPage - 1); const end = Math.min(totalPages, currentPage + 1); const pages = []; for (let page = start; page <= end; page += 1) pages.push(page); if (!pages.includes(1)) pages.unshift(1); if (!pages.includes(totalPages)) pages.push(totalPages); return [...new Set(pages)]; }
