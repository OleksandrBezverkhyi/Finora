/**
 * Reusable authentication form field wrapper with label and inline error rendering.
 *
 * @param {{
 *   label: string,
 *   error?: string,
 *   as?: keyof import("react").JSX.IntrinsicElements,
 *   className?: string,
 *   children?: import("react").ReactNode
 * }} props
 * @returns {import("react").JSX.Element}
 */
export default function AuthField({
  label,
  error,
  as = "input",
  className = "",
  children,
  ...props
}) {
  const Component = as;

  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </span>
      <Component
        className={`w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] placeholder:text-[var(--muted)]/70 ${className}`.trim()}
        {...props}
      >
        {children}
      </Component>
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
    </label>
  );
}
