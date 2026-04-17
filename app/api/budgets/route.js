import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getBudgetWithProgress,
  getExpenseCategories,
  getOwnedExpenseCategory,
  listBudgetsWithProgress,
} from "@/lib/budgets";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { budgetSchema } from "@/lib/validators";

const budgetFiltersSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function getCurrentBudgetPeriod() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export async function GET(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const currentPeriod = getCurrentBudgetPeriod();
  const rawFilters = {
    month: url.searchParams.get("month") || currentPeriod.month,
    year: url.searchParams.get("year") || currentPeriod.year,
  };

  const parsedFilters = budgetFiltersSchema.safeParse(rawFilters);

  if (!parsedFilters.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsedFilters.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { month, year } = parsedFilters.data;
  const [budgetData, categories] = await Promise.all([
    listBudgetsWithProgress({ userId: user.id, month, year }),
    getExpenseCategories(user.id),
  ]);

  return NextResponse.json({
    ...budgetData,
    categories,
  });
}

export async function POST(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parsedData = budgetSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const ownedCategory = await getOwnedExpenseCategory(user.id, parsedData.data.categoryId);

    if (!ownedCategory) {
      return NextResponse.json(
        {
          error: "Expense category not found",
        },
        { status: 404 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        ...parsedData.data,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    const budgetWithProgress = await getBudgetWithProgress({
      userId: user.id,
      budgetId: budget.id,
    });

    return NextResponse.json({ ok: true, budget: budgetWithProgress }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Budget for this category and period already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
