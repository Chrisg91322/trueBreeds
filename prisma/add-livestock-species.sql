-- Adds the combined Livestock species next to dog and cat.
-- Apply after pulling this schema change:
--   npx prisma db execute --file prisma/add-livestock-species.sql --schema prisma/schema.prisma
-- `prisma db push` also adds the enum value.

ALTER TYPE "Species" ADD VALUE IF NOT EXISTS 'livestock';
