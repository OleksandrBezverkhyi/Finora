import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { categorySchema } from "@/lib/validators";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getOwnedCategoryId(id, userId) {
  const category = await prisma.category.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });

  return category?.id ?? null;
}

export async function PUT(request, { params }) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const ownedCategoryId = await getOwnedCategoryId(id, user.id);

  if (!ownedCategoryId) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
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

    const category = await prisma.category.update({
      where: {
        id: ownedCategoryId,
      },
      data: parsedData.data,
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Category with this name and type already exists",
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
  const ownedCategoryId = await getOwnedCategoryId(id, user.id);

  if (!ownedCategoryId) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  try {
    await prisma.category.delete({
      where: {
        id: ownedCategoryId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Category cannot be deleted because it is already used in transactions or budgets",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
