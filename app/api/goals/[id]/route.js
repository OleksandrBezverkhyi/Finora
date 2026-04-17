import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { getGoalWithProgress } from "@/lib/goals";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { goalSchema } from "@/lib/validators";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getOwnedGoalId(id, userId) {
  const goal = await prisma.goal.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
    },
  });

  return goal?.id ?? null;
}

export async function PUT(request, { params }) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const { id } = await params;
  const ownedGoalId = await getOwnedGoalId(id, user.id);

  if (!ownedGoalId) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsedData = goalSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    await prisma.goal.update({
      where: {
        id: ownedGoalId,
      },
      data: parsedData.data,
    });

    const goal = await getGoalWithProgress({
      userId: user.id,
      goalId: ownedGoalId,
    });

    return NextResponse.json({ ok: true, goal });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2000") {
      return NextResponse.json(
        {
          error: "Goal data is too long",
        },
        { status: 400 }
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
  const ownedGoalId = await getOwnedGoalId(id, user.id);

  if (!ownedGoalId) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  try {
    await prisma.goal.delete({
      where: {
        id: ownedGoalId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
