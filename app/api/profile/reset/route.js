import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST() {
  const sessionUser = await getSessionUser();

  if (!sessionUser?.id) {
    return unauthorizedResponse();
  }

  try {
    await prisma.$transaction([
      prisma.budget.deleteMany({
        where: {
          userId: sessionUser.id,
        },
      }),
      prisma.transaction.deleteMany({
        where: {
          userId: sessionUser.id,
        },
      }),
      prisma.goal.deleteMany({
        where: {
          userId: sessionUser.id,
        },
      }),
      prisma.category.deleteMany({
        where: {
          userId: sessionUser.id,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "All account data has been cleared.",
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to clear account data right now.",
      },
      { status: 500 }
    );
  }
}
