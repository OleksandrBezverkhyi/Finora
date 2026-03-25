import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getOwnedCategory, serializeTransaction, transactionSelect } from "@/lib/transactions";
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

/**
 * Updates a transaction owned by the authenticated user.
 *
 * @param {Request} request
 * @param {{ params: Promise<{ id: string }> }} context
 * @returns {Promise<import("next/server").NextResponse>}
 */
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
      select: transactionSelect,
    });

    return NextResponse.json({
      ok: true,
      transaction: serializeTransaction(transaction),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ error: "Invalid category reference" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Deletes a transaction owned by the authenticated user.
 *
 * @param {Request} _request
 * @param {{ params: Promise<{ id: string }> }} context
 * @returns {Promise<import("next/server").NextResponse>}
 */
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
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
