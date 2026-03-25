import Container from "@/components/common/container";

/**
 * Layout for public pages such as login and registration.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").JSX.Element}
 */
export default function PublicLayout({ children }) {
  return (
    <div className="app-shell relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_70%)]" />
      <Container className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
        {children}
      </Container>
    </div>
  );
}
