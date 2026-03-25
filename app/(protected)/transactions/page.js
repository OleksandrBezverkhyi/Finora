import TransactionsManager from "@/components/transactions/transactions-manager";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

/**
 * Protected transactions page that loads initial categories, transactions, and pagination state.
 *
 * @returns {Promise<import("react").JSX.Element>}
 */
export default async function TransactionsPage() {
  const session = await requireSession();

  const [categories, transactions, total] = await Promise.all([
    prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    }),
    prisma.transaction.count({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Transactions</p>
            <h1 className="page-title max-w-3xl text-[var(--foreground)]">
              Add records, search history, and inspect spending without leaving one screen.
            </h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">
              Record each operation, quickly find past entries, and understand where your money goes
              over time.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            {total} transactions total
          </div>
        </div>
      </section>

      <TransactionsManager
        categories={categories}
        initialTransactions={transactions.map((transaction) => ({
          ...transaction,
          amount: transaction.amount.toString(),
        }))}
        initialPagination={{
          page: 1,
          pageSize: 10,
          total,
          totalPages: Math.max(1, Math.ceil(total / 10)),
        }}
      />
    </div>
  );
}
