import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId"));
    const type = searchParams.get("type"); // INCOME | EXPENSE | null

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

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const userId = Number(body.userId);
    const name = String(body.name || "").trim();
    const type = body.type; // INCOME | EXPENSE

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name,
        type,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);

    // Prisma unique constraint
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
