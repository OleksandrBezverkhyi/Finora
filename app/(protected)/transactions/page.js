import TransactionsManager from "@/components/transactions/transactions-manager";
import { OVERALL_EXPENSES_CATEGORY_NAME } from "@/lib/budgets";
import { formatPlural } from "@/lib/i18n";
import prisma from "@/lib/prisma";
import { getServerLocale, getServerMessages } from "@/lib/server-locale";
import { requireSession } from "@/lib/session";
import { serializeTransactionRecord } from "@/lib/transactions";

export default async function TransactionsPage() {
  const session = await requireSession();
  const locale = await getServerLocale();
  const messages = await getServerMessages();

  const [categories, transactions, total] = await Promise.all([
    prisma.category.findMany({
      where: {
        userId: session.user.id,
        name: {
          not: OVERALL_EXPENSES_CATEGORY_NAME,
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { id: true, name: true, type: true, color: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        comment: true,
        categoryName: true,
        categoryColor: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true, type: true, color: true } },
      },
    }),
    prisma.transaction.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.transactionsPage.eyebrow}</p>
            <h1 className="page-title max-w-3xl text-[var(--foreground)]">{messages.transactionsPage.title}</h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">{messages.transactionsPage.description}</p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            {locale === "uk"
              ? `${total} ${formatPlural(locale, total, {
                  one: "транзакція",
                  few: "транзакції",
                  many: "транзакцій",
                  other: "transactions",
                })}`
              : `${total} ${messages.transactionsPage.total}`}
          </div>
        </div>
      </section>

      <TransactionsManager
        categories={categories}
        initialTransactions={transactions.map(serializeTransactionRecord)}
        initialPagination={{ page: 1, pageSize: 10, total, totalPages: Math.max(1, Math.ceil(total / 10)) }}
      />
    </div>
  );
}
