import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { profileSchema } from "@/lib/validators";

const SALT_ROUNDS = 12;

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorizedResponse();
  }

  const profile = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    user: profile,
  });
}

export async function PUT(request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser?.id) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parsedData = profileSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: sessionUser.id,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData = {
      name: parsedData.data.name,
      currency: parsedData.data.currency,
    };

    if (parsedData.data.newPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(
        parsedData.data.currentPassword,
        currentUser.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          {
            error: "Current password is incorrect.",
          },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(parsedData.data.newPassword, SALT_ROUNDS);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: sessionUser.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to save profile right now.",
      },
      { status: 500 }
    );
  }
}
