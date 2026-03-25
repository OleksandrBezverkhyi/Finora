"use client";

import { formatMoney } from "@/components/dashboard/dashboard-formatters";

export default function DashboardTopCategories({ categories }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-6">
      <p className="text-sm font-medium text-[var(--muted)]">Top expense categories</p>
      <div className="mt-6 space-y-4">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">
            No expense categories to show for this period yet.
          </div>
        ) : (
          categories.map((category, index) => (
            <div
              key={category.categoryId}
              className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[var(--muted)]">#{index + 1}</span>
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/5"
                  style={{ backgroundColor: category.color || "#C2410C" }}
                />
                <span className="font-medium text-[var(--foreground)]">{category.name}</span>
              </div>
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {formatMoney(category.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
