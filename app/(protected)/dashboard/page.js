import DashboardOverview from "@/components/dashboard/dashboard-overview";
import prisma from "@/lib/prisma";
import { getRecommendations } from "@/lib/recommendations";
import { getServerMessages } from "@/lib/server-locale";
import { requireSession } from "@/lib/session";

function serializeTransaction(transaction) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
  };
}

export default async function DashboardPage() {
  const session = await requireSession();
  const messages = await getServerMessages();
  const userName = session.user.name || session.user.email || "User";
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const where = {
    userId: session.user.id,
    date: {
      gte: monthStart,
      lte: monthEnd,
    },
  };

  const [incomeAggregate, expenseAggregate, topExpenseGroups, recentTransactions] = await Promise.all([
    prisma.transaction.aggregate({ where: { ...where, type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { ...where, type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
    prisma.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        comment: true,
        category: { select: { id: true, name: true, color: true, type: true } },
      },
    }),
  ]);

  const categoryIds = topExpenseGroups.map((item) => item.categoryId);
  const categories = categoryIds.length
    ? await prisma.category.findMany({
        where: { id: { in: categoryIds }, userId: session.user.id },
        select: { id: true, name: true, color: true },
      })
    : [];
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const income = Number(incomeAggregate._sum.amount || 0);
  const expense = Number(expenseAggregate._sum.amount || 0);
  const initialSummary = {
    ok: true,
    period: { type: "month", from: monthStart.toISOString(), to: monthEnd.toISOString() },
    totals: {
      income: income.toFixed(2),
      expense: expense.toFixed(2),
      balance: (income - expense).toFixed(2),
    },
    topExpenseCategories: topExpenseGroups.map((item) => ({
      categoryId: item.categoryId,
      name: categoriesById.get(item.categoryId)?.name || "Unknown category",
      color: categoriesById.get(item.categoryId)?.color || null,
      amount: Number(item._sum.amount || 0).toFixed(2),
    })),
    recentTransactions: recentTransactions.map(serializeTransaction),
  };

  const initialRecommendations = await getRecommendations({
    userId: session.user.id,
    period: "month",
    from: monthStart,
    to: monthEnd,
  });

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.dashboardPage.eyebrow}</p>
            <h1 className="page-title max-w-2xl text-[var(--foreground)]">
              {messages.dashboardPage.title.replace("{name}", userName)}
            </h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">{messages.dashboardPage.description}</p>
          </div>
        </div>
      </section>

      <DashboardOverview initialSummary={initialSummary} initialRecommendations={initialRecommendations} />
    </div>
  );
}
