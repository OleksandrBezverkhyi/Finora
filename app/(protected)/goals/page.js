import GoalsManager from "@/components/goals/goals-manager";
import { listGoalsWithProgress } from "@/lib/goals";
import { requireSession } from "@/lib/session";

export default async function GoalsPage() {
  const session = await requireSession();
  const initialGoalsData = await listGoalsWithProgress({
    userId: session.user.id,
  });

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Goals</p>
            <h1 className="page-title max-w-3xl text-[var(--foreground)]">
              Track savings goals and see the pace needed to reach them on time.
            </h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">
              Define a target, record your current savings, and review the recommended amount to
              set aside each week or month.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            {initialGoalsData.goals.length} goals tracked
          </div>
        </div>
      </section>

      <GoalsManager initialGoalsData={initialGoalsData} />
    </div>
  );
}
