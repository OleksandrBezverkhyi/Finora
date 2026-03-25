import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

/**
 * Returns the current server-side authentication session from Auth.js.
 *
 * @returns {Promise<import("next-auth").Session | null>} Active session or `null` when the user is not authenticated.
 */
export async function getServerAuthSession() {
  return auth();
}

/**
 * Extracts the authenticated user object from the current server session.
 *
 * @returns {Promise<import("next-auth").Session["user"] | null>} Authenticated user payload or `null` if no session exists.
 */
export async function getSessionUser() {
  const session = await getServerAuthSession();

  return session?.user ?? null;
}

/**
 * Ensures that the current request belongs to an authenticated user.
 * Redirects to `/login` when the session is missing.
 *
 * @returns {Promise<import("next-auth").Session>} Guaranteed authenticated session.
 */
export async function requireSession() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}
