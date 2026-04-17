import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getGoalWithProgress, listGoalsWithProgress } from "@/lib/goals";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { goalSchema } from "@/lib/validators";

const goalFiltersSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const rawFilters = {
    status: url.searchParams.get("status") || undefined,
  };

  const parsedFilters = goalFiltersSchema.safeParse(rawFilters);

  if (!parsedFilters.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsedFilters.error.flatten(),
      },
      { status: 400 }
    );
  }

  const result = await listGoalsWithProgress({
    userId: user.id,
    status: parsedFilters.data.status,
  });

  return NextResponse.json(result);
}

export async function POST(request) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
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

    const createdGoal = await prisma.goal.create({
      data: {
        ...parsedData.data,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    const goal = await getGoalWithProgress({
      userId: user.id,
      goalId: createdGoal.id,
    });

    return NextResponse.json({ ok: true, goal }, { status: 201 });
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
