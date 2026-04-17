import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { getBudgetWithProgress, getOwnedExpenseCategory } from "@/lib/budgets";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { budgetSchema } from "@/lib/validators";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getOwnedBudgetId(id, userId) {
  const budget = await prisma.budget.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });

  return budget?.id ?? null;
}

export async function PUT(request, { params }) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const ownedBudgetId = await getOwnedBudgetId(id, user.id);

  if (!ownedBudgetId) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
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

    await prisma.budget.update({
      where: {
        id: ownedBudgetId,
      },
      data: parsedData.data,
    });

    const budget = await getBudgetWithProgress({
      userId: user.id,
      budgetId: ownedBudgetId,
    });

    return NextResponse.json({ ok: true, budget });
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

export async function DELETE(_request, { params }) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const ownedBudgetId = await getOwnedBudgetId(id, user.id);

  if (!ownedBudgetId) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  try {
    await prisma.budget.delete({
      where: {
        id: ownedBudgetId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
