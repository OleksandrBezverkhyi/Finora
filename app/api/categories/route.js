import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { categorySchema } from "@/lib/validators";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Returns all categories owned by the authenticated user.
 *
 * @returns {Promise<import("next/server").NextResponse>}
 */
export async function GET() {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
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

/**
 * Creates a new category for the authenticated user.
 *
 * @param {Request} request
 * @returns {Promise<import("next/server").NextResponse>}
 */
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

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
