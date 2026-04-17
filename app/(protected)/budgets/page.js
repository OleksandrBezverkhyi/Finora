import BudgetsManager from "@/components/budgets/budgets-manager";
import { getExpenseCategories, listBudgetsWithProgress } from "@/lib/budgets";
import { requireSession } from "@/lib/session";

export default async function BudgetsPage() {
  const session = await requireSession();
  const now = new Date();
  const initialMonth = now.getMonth() + 1;
  const initialYear = now.getFullYear();

  const [initialBudgetData, initialCategories] = await Promise.all([
    listBudgetsWithProgress({
      userId: session.user.id,
      month: initialMonth,
      year: initialYear,
    }),
    getExpenseCategories(session.user.id),
  ]);

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Budgets</p>
            <h1 className="page-title max-w-3xl text-[var(--foreground)]">
              Set monthly spending limits and track progress before you go over budget.
            </h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">
              Create limits for your expense categories and see how much has already been spent in
              the selected month.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            {initialBudgetData.budgets.length} budgets this month
          </div>
        </div>
      </section>

      <BudgetsManager
        initialBudgetData={initialBudgetData}
        initialCategories={initialCategories}
        initialMonth={initialMonth}
        initialYear={initialYear}
      />
    </div>
  );
}
