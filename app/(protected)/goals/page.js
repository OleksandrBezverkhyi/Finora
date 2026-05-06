import GoalsManager from "@/components/goals/goals-manager";
import { formatPlural } from "@/lib/i18n";
import { listGoalsWithProgress } from "@/lib/goals";
import { getServerLocale, getServerMessages } from "@/lib/server-locale";
import { requireSession } from "@/lib/session";

export default async function GoalsPage() {
  const session = await requireSession();
  const locale = await getServerLocale();
  const messages = await getServerMessages();
  const initialGoalsData = await listGoalsWithProgress({ userId: session.user.id });

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.goalsPage.eyebrow}</p>
            <h1 className="page-title max-w-3xl text-[var(--foreground)]">{messages.goalsPage.title}</h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">{messages.goalsPage.description}</p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            {locale === "uk"
              ? `${initialGoalsData.goals.length} ${formatPlural(locale, initialGoalsData.goals.length, {
                  one: "ціль",
                  few: "цілі",
                  many: "цілей",
                  other: "goals",
                })}`
              : `${initialGoalsData.goals.length} ${messages.goalsPage.count}`}
          </div>
        </div>
      </section>

      <GoalsManager initialGoalsData={initialGoalsData} />
    </div>
  );
}
