/**
 * Shared width-constrained wrapper used across public and protected layouts.
 *
 * @param {{ children: import("react").ReactNode, className?: string }} props
 * @returns {import("react").JSX.Element}
 */
export default function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-7xl ${className}`.trim()}>{children}</div>;
}
