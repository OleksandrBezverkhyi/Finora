import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

const SALT_ROUNDS = 12;

export async function POST(request) {
  try {
    const body = await request.json();
    const parsedData = registerSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password, name, currency } = parsedData.data;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        currency,
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Email already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
