ALTER TABLE "Transaction"
ADD COLUMN "categoryName" VARCHAR(40),
ADD COLUMN "categoryColor" VARCHAR(7);

UPDATE "Transaction" AS t
SET
  "categoryName" = c."name",
  "categoryColor" = c."color"
FROM "Category" AS c
WHERE t."categoryId" = c."id";

ALTER TABLE "Transaction"
ALTER COLUMN "categoryName" SET NOT NULL;

ALTER TABLE "Transaction"
ALTER COLUMN "categoryId" DROP NOT NULL;

ALTER TABLE "Transaction"
DROP CONSTRAINT "Transaction_categoryId_fkey";

ALTER TABLE "Transaction"
ADD CONSTRAINT "Transaction_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
