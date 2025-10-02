-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "sourcePdfPageFrom" INTEGER,
ADD COLUMN     "sourcePdfPageTo" INTEGER;

-- AlterTable
ALTER TABLE "ImportJob" ADD COLUMN     "payloadMeta" JSONB,
ADD COLUMN     "sourceType" TEXT;

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "sourcePdfUrl" TEXT;
