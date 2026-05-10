"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isItemActive(pathname, href) {
  if (pathname === href) {
    return true;
  }

  if (href === "/dashboard") {
    return pathname === "/";
  }

  return pathname.startsWith(`${href}/`);
}

export default function NavLinks({ items }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = isItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={
              "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ease-out " +
              (isActive
                ? "border border-[var(--accent)] bg-[var(--accent)] !text-white shadow-[0_10px_24px_rgba(15,118,110,0.18)] hover:!text-white"
                : "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:bg-[var(--accent)] hover:!text-white")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
