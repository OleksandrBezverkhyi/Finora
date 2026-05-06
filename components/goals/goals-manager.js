"use client";

import { useState } from "react";

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

const initialErrors = {
  name: [],
  targetAmount: [],
  currentAmount: [],
  targetDate: [],
  note: [],
  status: [],
};

const initialForm = {
  name: "",
  targetAmount: "",
  currentAmount: "0",
  targetDate: "",
  note: "",
  status: "ACTIVE",
};

export default function GoalsManager({ initialGoalsData }) {
  const [goalsData, setGoalsData] = useState(initialGoalsData);
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialErrors);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function resetForm() {
    setFormData(initialForm);
    setFieldErrors(initialErrors);
    setFormError("");
    setEditingId(null);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "targetDate") {
      setFieldErrors((current) => ({
        ...current,
        targetDate: [],
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFieldErrors(initialErrors);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? "/api/goals/" + editingId : "/api/goals";
    const targetDate = formData.targetDate || "";

    if (targetDate && formData.status === "ACTIVE" && !isTodayOrFutureDate(targetDate)) {
      setFieldErrors((current) => ({
        ...current,
        targetDate: ["Active goals must use today or a future date."],
      }));
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      targetDate,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.issues) {
          setFieldErrors({
            ...initialErrors,
            ...data.issues.fieldErrors,
          });
          setFormError(data.issues.formErrors?.[0] || "");
          return;
        }

        setFormError(data.error || "Unable to save goal right now.");
        return;
      }

      const nextGoals = editingId
        ? goalsData.goals.map((goal) => (goal.id === data.goal.id ? data.goal : goal))
        : [...goalsData.goals, data.goal];

      setGoalsData(recalculateGoalsData(nextGoals));
      resetForm();
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(goal) {
    setEditingId(goal.id);
    setFieldErrors(initialErrors);
    setFormError("");
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: toDateInputValue(goal.targetDate),
      note: goal.note || "",
      status: goal.status,
    });
  }

  async function handleDelete(goalId) {
    setDeletingId(goalId);
    setFormError("");

    try {
      const response = await fetch("/api/goals/" + goalId, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || "Unable to delete goal right now.");
        return;
      }

      setGoalsData((current) => recalculateGoalsData(current.goals.filter((goal) => goal.id !== goalId)));

      if (editingId === goalId) {
        resetForm();
      }
    } catch {
      setFormError("Unexpected error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function renderFieldError(fieldName) {
    const error = fieldErrors[fieldName]?.[0];

    if (!error) {
      return null;
    }

    return <p className="mt-2 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
      <section className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Target" value={formatMoney(goalsData.totals.target)} />
          <SummaryCard label="Saved" value={formatMoney(goalsData.totals.saved)} />
          <SummaryCard
            label="Active goals"
            value={String(goalsData.totals.activeCount)}
            hint={goalsData.totals.completedCount + " completed"}
          />
        </div>

        <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
          <div className="space-y-3">
            <p className="eyebrow">{editingId ? "Edit goal" : "Add goal"}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {editingId ? "Update savings goal" : "Create a new savings goal"}
            </h2>
            <p className="muted text-sm leading-6">
              Set a target amount, track progress, and optionally define a target date to receive a
              recommended weekly and monthly savings pace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Goal name
              </span>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Emergency fund"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              />
              {renderFieldError("name")}
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Target amount, ₴
                </span>
                <input
                  name="targetAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  placeholder="100000.00"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                {renderFieldError("targetAmount")}
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Current amount, ₴
                </span>
                <input
                  name="currentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.currentAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
                {renderFieldError("currentAmount")}
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Target date
                </span>
                <input
                  name="targetDate"
                  type="date"
                  lang="en-GB"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className={
                    "w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] " +
                    (formData.targetDate ? "text-[var(--foreground)]" : "text-[var(--muted)]")
                  }
                />
                {renderFieldError("targetDate")}
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Status
                </span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {renderFieldError("status")}
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Note
              </span>
              <textarea
                name="note"
                rows="4"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Describe what you are saving for."
                className="w-full rounded-[1.5rem] border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              />
              {renderFieldError("note")}
            </label>

            {formError ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {formError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? editingId
                    ? "Saving..."
                    : "Creating..."
                  : editingId
                    ? "Save changes"
                    : "Add goal"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Progress</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              Goals and savings pace
            </h2>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-sm font-medium text-[var(--muted)]">
            {goalsData.goals.length} goals
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {goalsData.goals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
              You have not created any goals yet.
            </div>
          ) : (
            goalsData.goals.map((goal) => (
              <article
                key={goal.id}
                className={
                  "rounded-2xl border px-4 py-4 transition " +
                  (goal.displayStatus === "ARCHIVED"
                    ? "border-stone-200 bg-stone-50/80"
                    : goal.displayStatus === "COMPLETED"
                      ? "border-emerald-200 bg-emerald-50/80"
                      : goal.recommendation.isOverdue
                        ? "border-rose-300 bg-rose-50/80"
                        : "border-[var(--border)] bg-white/75")
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{goal.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Saved {formatMoney(goal.currentAmount)} of {formatMoney(goal.targetAmount)}
                      </p>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200/80">
                      <div
                        className={
                          "h-full rounded-full " +
                          (goal.displayStatus === "COMPLETED"
                            ? "bg-emerald-500"
                            : goal.recommendation.isOverdue
                              ? "bg-rose-500"
                              : "bg-[var(--accent)]")
                        }
                        style={{ width: String(Math.max(goal.progressPercent, 4)) + "%" }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                      <span>{goal.progressPercent}% reached</span>
                      <span>Remaining {formatMoney(goal.remainingAmount)}</span>
                      {goal.targetDate ? <span>Target {formatDate(goal.targetDate)}</span> : null}
                    </div>

                    <p className="text-sm text-[var(--muted)]">
                      {getRecommendationLabel(goal)}
                    </p>

                    {goal.note ? <p className="text-sm text-[var(--foreground)]/80">{goal.note}</p> : null}
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <span className={getStatusBadgeClass(goal)}>{getStatusLabel(goal)}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(goal)}
                        className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(goal.id)}
                        disabled={deletingId === goal.id}
                        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {deletingId === goal.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function recalculateGoalsData(goals) {
  const sortedGoals = sortGoals(goals);
  const totals = sortedGoals.reduce(
    (accumulator, goal) => ({
      target: accumulator.target + Number(goal.targetAmount),
      saved: accumulator.saved + Number(goal.currentAmount),
      activeCount: accumulator.activeCount + (goal.displayStatus === "ACTIVE" ? 1 : 0),
      completedCount: accumulator.completedCount + (goal.displayStatus === "COMPLETED" ? 1 : 0),
    }),
    {
      target: 0,
      saved: 0,
      activeCount: 0,
      completedCount: 0,
    }
  );

  return {
    goals: sortedGoals,
    totals: {
      target: totals.target.toFixed(2),
      saved: totals.saved.toFixed(2),
      remaining: Math.max(totals.target - totals.saved, 0).toFixed(2),
      activeCount: totals.activeCount,
      completedCount: totals.completedCount,
    },
  };
}

function sortGoals(goals) {
  const statusWeight = {
    ACTIVE: 0,
    COMPLETED: 1,
    ARCHIVED: 2,
  };

  return [...goals].sort((left, right) => {
    const statusDiff = statusWeight[left.status] - statusWeight[right.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    const leftDate = left.targetDate ? new Date(left.targetDate).getTime() : Number.POSITIVE_INFINITY;
    const rightDate = right.targetDate ? new Date(right.targetDate).getTime() : Number.POSITIVE_INFINITY;

    if (leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

function SummaryCard({ label, value, hint }) {
  return (
    <div className="glass-panel rounded-[1.5rem] p-5">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "UAH",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function getStartOfToday() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function isTodayOrFutureDate(value) {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date >= getStartOfToday();
}

function getStatusLabel(goal) {
  if (goal.displayStatus === "ARCHIVED") {
    return "Archived";
  }

  if (goal.displayStatus === "COMPLETED") {
    return "Completed";
  }

  if (goal.recommendation.isOverdue) {
    return "Overdue";
  }

  return "Active";
}

function getStatusBadgeClass(goal) {
  if (goal.displayStatus === "ARCHIVED") {
    return "rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700";
  }

  if (goal.displayStatus === "COMPLETED") {
    return "rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700";
  }

  if (goal.recommendation.isOverdue) {
    return "rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700";
  }

  return "rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]";
}

function getRecommendationLabel(goal) {
  const recommendation = goal.recommendation;

  if (!recommendation.hasTargetDate) {
    return "Add a target date to receive a weekly and monthly savings recommendation.";
  }

  if (goal.displayStatus === "COMPLETED") {
    return "Goal achieved. Keep the momentum going toward your next milestone.";
  }

  if (recommendation.isOverdue) {
    return "Target date has passed. To catch up, set aside " + formatMoney(recommendation.weeklyAmount) + " this week or " + formatMoney(recommendation.monthlyAmount) + " this month.";
  }

  return "Recommended pace: " + formatMoney(recommendation.weeklyAmount) + " per week or " + formatMoney(recommendation.monthlyAmount) + " per month.";
}
