import AppShell from "@/components/common/app-shell";

export default function ProtectedLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
