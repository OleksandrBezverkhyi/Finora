import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { OVERALL_EXPENSES_CATEGORY_NAME } from "@/lib/budgets";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { categorySchema } from "@/lib/validators";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
      name: {
        not: OVERALL_EXPENSES_CATEGORY_NAME,
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, categories });
}

export async function POST(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parsedData = categorySchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (
      parsedData.data.type === "EXPENSE" &&
      parsedData.data.name === OVERALL_EXPENSES_CATEGORY_NAME
    ) {
      return NextResponse.json(
        {
          error: "Category name is reserved",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        ...parsedData.data,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Category with this name and type already exists",
        },
        { status: 409 }
      );
    }

    console.error("Create category failed", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
