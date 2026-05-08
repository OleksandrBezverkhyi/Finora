import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { OVERALL_EXPENSES_CATEGORY_NAME } from "@/lib/budgets";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { transactionSchema } from "@/lib/validators";

const PAGE_SIZE = 10;

const transactionFiltersSchema = z.object({
  period: z.enum(["day", "week", "month", "custom"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().trim().min(1).optional(),
  q: z.string().trim().max(100).optional(),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function getPeriodRange(period) {
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

function buildDateFilter(filters) {
  if (filters.period && filters.period !== "custom") {
    return getPeriodRange(filters.period);
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

function buildOrderBy(sort) {
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

async function getOwnedCategory(categoryId, userId) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      name: {
        not: OVERALL_EXPENSES_CATEGORY_NAME,
      },
    },
    select: {
      id: true,
      type: true,
      name: true,
      color: true,
    },
  });
}

function serializeTransaction(transaction) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
  };
}

export async function GET(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const rawFilters = {
    period: url.searchParams.get("period") || undefined,
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    type: url.searchParams.get("type") || undefined,
    categoryId: url.searchParams.get("categoryId") || undefined,
    q: url.searchParams.get("q") || undefined,
    min: url.searchParams.get("min") || undefined,
    max: url.searchParams.get("max") || undefined,
    sort: url.searchParams.get("sort") || undefined,
    page: url.searchParams.get("page") || "1",
  };

  const parsedFilters = transactionFiltersSchema.safeParse(rawFilters);

  if (!parsedFilters.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsedFilters.error.flatten(),
      },
      { status: 400 }
    );
  }

  const filters = parsedFilters.data;

  if (filters.min !== undefined && filters.max !== undefined && filters.min > filters.max) {
    return badRequest("Minimum amount cannot be greater than maximum amount");
  }

  if (filters.categoryId) {
    const ownedCategory = await getOwnedCategory(filters.categoryId, user.id);

    if (!ownedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
  }

  const dateRange = buildDateFilter(filters);

  if (dateRange?.start && dateRange?.end && dateRange.start > dateRange.end) {
    return badRequest("From date cannot be later than to date");
  }

  const where = {
    userId: user.id,
  };

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

  const page = filters.page ?? 1;
  const skip = (page - 1) * PAGE_SIZE;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: buildOrderBy(filters.sort),
      skip,
      take: PAGE_SIZE,
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
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    ok: true,
    transactions: transactions.map(serializeTransaction),
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    },
  });
}

export async function POST(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parsedData = transactionSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const transactionData = parsedData.data;
    const ownedCategory = await getOwnedCategory(transactionData.categoryId, user.id);

    if (!ownedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (ownedCategory.type !== transactionData.type) {
      return badRequest("Transaction type must match category type");
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        userId: user.id,
      },
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
    });

    return NextResponse.json(
      {
        ok: true,
        transaction: serializeTransaction(transaction),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ error: "Invalid category reference" }, { status: 400 });
    }

    console.error("Create transaction failed", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
