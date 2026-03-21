import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const usersCount = await prisma.user.count();

    return NextResponse.json({ ok: true, usersCount });
  } catch (error) {
    console.error("Database check failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
