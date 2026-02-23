import { prisma } from "@/lib/prisma";

export async function GET() {
  const usersCount = await prisma.user.count();
  return Response.json({ ok: true, usersCount });
}
