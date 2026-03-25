import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import {
  buildTransactionDateFilter,
  getOwnedCategory,
  listTransactions,
  serializeTransaction,
  transactionSelect,
} from "@/lib/transactions";
import { transactionSchema } from "@/lib/validators";

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

function parseFilters(requestUrl) {
  const url = new URL(requestUrl);

  return transactionFiltersSchema.safeParse({
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
  });
}

export async function GET(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const parsedFilters = parseFilters(request.url);

  if (!parsedFilters.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsedFilters.error.flatten() },
      { status: 400 }
    );
  }

  const filters = parsedFilters.data;

  if (filters.min !== undefined && filters.max !== undefined && filters.min > filters.max) {
    return badRequest("Minimum amount cannot be greater than maximum amount");
  }

  if (filters.categoryId && !(await getOwnedCategory(filters.categoryId, user.id))) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const dateRange = buildTransactionDateFilter(filters);

  if (dateRange?.start && dateRange?.end && dateRange.start > dateRange.end) {
    return badRequest("From date cannot be later than to date");
  }

  const result = await listTransactions(user.id, filters);

  return NextResponse.json({
    ok: true,
    transactions: result.transactions,
    pagination: result.pagination,
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
        { error: "Validation failed", issues: parsedData.error.flatten() },
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
      select: transactionSelect,
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

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
