const { config } = require("dotenv");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

config({ path: ".env" });
config({ path: ".env.local", override: true });

const STARTER_CATEGORIES = [
  { name: "Salary", type: "INCOME", color: "#0F766E" },
  { name: "Freelance", type: "INCOME", color: "#1D4ED8" },
  { name: "Bonus", type: "INCOME", color: "#7C3AED" },
  { name: "Investments", type: "INCOME", color: "#CA8A04" },
  { name: "Groceries", type: "EXPENSE", color: "#EA580C" },
  { name: "Transport", type: "EXPENSE", color: "#2563EB" },
  { name: "Rent", type: "EXPENSE", color: "#DC2626" },
  { name: "Utilities", type: "EXPENSE", color: "#0891B2" },
  { name: "Health", type: "EXPENSE", color: "#16A34A" },
  { name: "Entertainment", type: "EXPENSE", color: "#9333EA" },
  { name: "Education", type: "EXPENSE", color: "#D97706" },
  { name: "Shopping", type: "EXPENSE", color: "#DB2777" },
];

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

async function seedUserCategories(prisma, user) {
  const result = await prisma.category.createMany({
    data: STARTER_CATEGORIES.map((category) => ({
      ...category,
      userId: user.id,
    })),
    skipDuplicates: true,
  });

  return result.count;
}

async function main() {
  const prisma = createPrismaClient();

  try {
    const targetEmail = process.env.SEED_USER_EMAIL?.trim().toLowerCase() || null;
    const users = await prisma.user.findMany({
      where: targetEmail ? { email: targetEmail } : undefined,
      select: {
        id: true,
        email: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (users.length === 0) {
      console.log(
        targetEmail
          ? `No user found for SEED_USER_EMAIL=${targetEmail}.`
          : "No users found. Register a user first, then run the seed again."
      );
      return;
    }

    let totalCreated = 0;

    for (const user of users) {
      const createdForUser = await seedUserCategories(prisma, user);
      totalCreated += createdForUser;
      console.log(`Seeded ${createdForUser} starter categories for ${user.email}.`);
    }

    console.log(`Starter category seed completed. Total categories created: ${totalCreated}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
