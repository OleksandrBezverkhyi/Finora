import AppShell from "@/components/common/app-shell";

/**
 * Layout wrapper for authenticated application routes.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").JSX.Element}
 */
export default function ProtectedLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
