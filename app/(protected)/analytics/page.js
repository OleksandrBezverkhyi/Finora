import AnalyticsOverview from "@/components/analytics/analytics-overview";
import { getCompareAnalytics, getExpenseByCategoryAnalytics, getTrendAnalytics } from "@/lib/analytics";
import { getServerMessages } from "@/lib/server-locale";
import { requireSession } from "@/lib/session";

export default async function AnalyticsPage() {
  const session = await requireSession();
  const messages = await getServerMessages();
  const userName = session.user.name || session.user.email || "User";
  const baseParams = { userId: session.user.id, period: "month" };

  const [initialTrend, initialByCategory, initialCompare] = await Promise.all([
    getTrendAnalytics(baseParams),
    getExpenseByCategoryAnalytics(baseParams),
    getCompareAnalytics(baseParams),
  ]);

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.analyticsPage.eyebrow}</p>
            <h1 className="page-title max-w-2xl text-[var(--foreground)]">{messages.analyticsPage.title.replace("{name}", userName)}</h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">{messages.analyticsPage.description}</p>
          </div>
        </div>
      </section>

      <AnalyticsOverview initialTrend={initialTrend} initialByCategory={initialByCategory} initialCompare={initialCompare} />
    </div>
  );
}
