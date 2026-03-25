import { redirect } from "next/navigation";

/**
 * Redirects the root route to the login page.
 *
 * @returns {never}
 */
export default function HomePage() {
  redirect("/login");
}
