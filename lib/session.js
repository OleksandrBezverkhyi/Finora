import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function getServerAuthSession() {
  return auth();
}

export async function getSessionUser() {
  const session = await getServerAuthSession();

  return session?.user ?? null;
}

export async function requireSession() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}
