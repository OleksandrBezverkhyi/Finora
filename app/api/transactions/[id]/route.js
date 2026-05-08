import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { OVERALL_EXPENSES_CATEGORY_NAME } from "@/lib/budgets";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { transactionSchema } from "@/lib/validators";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

async function getOwnedTransaction(id, userId) {
  return prisma.transaction.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });
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

export async function PUT(request, { params }) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const ownedTransaction = await getOwnedTransaction(id, user.id);

  if (!ownedTransaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
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

    const transaction = await prisma.transaction.update({
      where: {
        id: ownedTransaction.id,
      },
      data: transactionData,
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

    return NextResponse.json({
      ok: true,
      transaction: serializeTransaction(transaction),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ error: "Invalid category reference" }, { status: 400 });
    }

    console.error("Update transaction failed", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const ownedTransaction = await getOwnedTransaction(id, user.id);

  if (!ownedTransaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  try {
    await prisma.transaction.delete({
      where: {
        id: ownedTransaction.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete transaction failed", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
