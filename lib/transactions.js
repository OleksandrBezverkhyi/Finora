import prisma from "@/lib/prisma";

export const PAGE_SIZE = 10;

export const transactionSelect = {
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
};

export function getTransactionPeriodRange(period) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "week") {
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  return null;
}

export function buildTransactionDateFilter(filters) {
  if (filters.period && filters.period !== "custom") {
    return getTransactionPeriodRange(filters.period);
  }

  if (!filters.from && !filters.to) {
    return null;
  }

  const start = filters.from ? new Date(filters.from) : null;
  const end = filters.to ? new Date(filters.to) : null;

  if (start) {
    start.setHours(0, 0, 0, 0);
  }

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export function buildTransactionOrderBy(sort) {
  switch (sort) {
    case "date_asc":
      return [{ date: "asc" }, { createdAt: "asc" }];
    case "amount_desc":
      return [{ amount: "desc" }, { date: "desc" }];
    case "amount_asc":
      return [{ amount: "asc" }, { date: "desc" }];
    case "date_desc":
    default:
      return [{ date: "desc" }, { createdAt: "desc" }];
  }
}

/**
 * Fetches a category only if it belongs to the authenticated user.
 * Used to prevent linking transactions to categories owned by another user.
 *
 * @param {string} categoryId
 * @param {string} userId
 * @returns {Promise<{ id: string, type: string, name: string, color: string | null } | null>}
 */
export async function getOwnedCategory(categoryId, userId) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
    select: {
      id: true,
      type: true,
      name: true,
      color: true,
    },
  });
}

export function serializeTransaction(transaction) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
  };
}

/**
 * Converts parsed transaction filters into a Prisma `where` object scoped to one user.
 * This includes period filtering, type/category filtering, amount range, and text search.
 *
 * @param {string} userId
 * @param {{ type?: string, categoryId?: string, q?: string, min?: number, max?: number }} filters
 * @param {{ start?: Date | null, end?: Date | null } | null} dateRange
 * @returns {Record<string, unknown>} Prisma-compatible `where` clause.
 */
export function buildTransactionWhere(userId, filters, dateRange) {
  const where = { userId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.q) {
    where.OR = [
      {
        comment: {
          contains: filters.q,
          mode: "insensitive",
        },
      },
      {
        category: {
          name: {
            contains: filters.q,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (filters.min !== undefined || filters.max !== undefined) {
    where.amount = {};

    if (filters.min !== undefined) {
      where.amount.gte = filters.min;
    }

    if (filters.max !== undefined) {
      where.amount.lte = filters.max;
    }
  }

  if (dateRange?.start || dateRange?.end) {
    where.date = {};

    if (dateRange.start) {
      where.date.gte = dateRange.start;
    }

    if (dateRange.end) {
      where.date.lte = dateRange.end;
    }
  }

  return where;
}

/**
 * Returns a paginated transaction list with normalized monetary values and pagination metadata.
 * This helper is used by the transactions API and keeps query construction in one place.
 *
 * @param {string} userId
 * @param {{ page?: number, sort?: string, period?: string, from?: Date | string, to?: Date | string, type?: string, categoryId?: string, q?: string, min?: number, max?: number }} filters
 * @returns {Promise<{
 *   transactions: Array<Record<string, unknown>>,
 *   pagination: { page: number, pageSize: number, total: number, totalPages: number },
 *   dateRange: { start: Date | null, end: Date | null } | null
 * }>}
 */
export async function listTransactions(userId, filters) {
  const page = filters.page ?? 1;
  const skip = (page - 1) * PAGE_SIZE;
  const dateRange = buildTransactionDateFilter(filters);
  const where = buildTransactionWhere(userId, filters, dateRange);
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: buildTransactionOrderBy(filters.sort),
      skip,
      take: PAGE_SIZE,
      select: transactionSelect,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map(serializeTransaction),
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    },
    dateRange,
  };
}
