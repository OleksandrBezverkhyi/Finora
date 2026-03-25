import CategoriesManager from "@/components/categories/categories-manager";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

/**
 * Protected categories page that loads user categories and passes them to the management UI.
 *
 * @returns {Promise<import("react").JSX.Element>}
 */
export default async function CategoriesPage() {
  const session = await requireSession();

  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Categories</p>
            <h1 className="page-title max-w-3xl text-[var(--foreground)]">
              Organize income and expense groups before adding transactions.
            </h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">
              Keep your records tidy by grouping transactions into clear income and expense
              categories that match your everyday spending.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            {categories.length} categories
          </div>
        </div>
      </section>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
