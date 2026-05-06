import CategoriesManager from "@/components/categories/categories-manager";
import prisma from "@/lib/prisma";
import { getServerMessages } from "@/lib/server-locale";
import { requireSession } from "@/lib/session";

export default async function CategoriesPage() {
  const session = await requireSession();
  const messages = await getServerMessages();

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: { id: true, name: true, type: true, color: true, createdAt: true, updatedAt: true },
  });

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.categoriesPage.eyebrow}</p>
            <h1 className="page-title max-w-3xl text-[var(--foreground)]">{messages.categoriesPage.title}</h1>
            <p className="muted max-w-2xl text-sm leading-6 sm:text-base">{messages.categoriesPage.description}</p>
          </div>
          <div className="rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            {categories.length} {messages.categoriesPage.count}
          </div>
        </div>
      </section>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
