import BudgetsManager from "@/components/budgets/budgets-manager";
import { formatPlural } from "@/lib/i18n";
import { getExpenseCategories, listBudgetsWithProgress } from "@/lib/budgets";
import { getServerLocale, getServerMessages } from "@/lib/server-locale";
import { requireSession } from "@/lib/session";

export default async function BudgetsPage() {
  const session = await requireSession();
  const locale = await getServerLocale();
  const messages = await getServerMessages();
  const now = new Date();
  const initialMonth = now.getMonth() + 1;
  const initialYear = now.getFullYear();

  const [initialBudgetData, initialCategories] = await Promise.all([
    listBudgetsWithProgress({ userId: session.user.id, month: initialMonth, year: initialYear }),
    getExpenseCategories(session.user.id),
  ]);

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.budgetsPage.eyebrow}</p>
            <h1 className="page-title max-w-3xl text-[var(--foreground)]">{messages.budgetsPage.title}</h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">{messages.budgetsPage.description}</p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            {locale === "uk"
              ? `${initialBudgetData.budgets.length} ${formatPlural(locale, initialBudgetData.budgets.length, {
                  one: "ліміт",
                  few: "ліміти",
                  many: "лімітів",
                  other: "budgets",
                })} цього місяця`
              : `${initialBudgetData.budgets.length} ${messages.budgetsPage.count}`}
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
