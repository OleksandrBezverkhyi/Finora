import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = Number(searchParams.get("userId"));
    const type = searchParams.get("type"); // INCOME | EXPENSE
    const categoryIdParam = searchParams.get("categoryId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = (searchParams.get("q") || "").trim();

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const where = { userId };

    if (type) {
      if (!["INCOME", "EXPENSE"].includes(type)) {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
      }
      where.type = type;
    }

    if (categoryIdParam) {
      const categoryId = Number(categoryIdParam);
      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return NextResponse.json(
          { error: "Invalid categoryId" },
          { status: 400 },
        );
      }
      where.categoryId = categoryId;
    }

    if (from || to) {
      where.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid from date" },
            { status: 400 },
          );
        }
        where.date.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid to date" },
            { status: 400 },
          );
        }
        where.date.lte = toDate;
      }
    }

    if (q) {
      where.note = {
        contains: q,
        mode: "insensitive",
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const userId = Number(body.userId);
    const categoryId = Number(body.categoryId);
    const type = body.type; // INCOME | EXPENSE
    const amount = Number(body.amount);
    const date = new Date(body.date);
    const note = body.note ? String(body.note).trim() : null;

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { error: "Invalid categoryId" },
        { status: 400 },
      );
    }
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Перевіряємо, що категорія існує і належить користувачу
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      select: { id: true, type: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found for this user" },
        { status: 404 },
      );
    }

    if (category.type !== type) {
      return NextResponse.json(
        { error: "Transaction type does not match category type" },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        type,
        amount: String(amount), // для Decimal
        date,
        note,
      },
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
