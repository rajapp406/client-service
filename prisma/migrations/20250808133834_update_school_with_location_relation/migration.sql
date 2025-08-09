/*
  Warnings:

  - You are about to drop the column `location` on the `School` table. All the data in the column will be lost.
  - Added the column `cityId` to the `School` table. If the table is not empty, ensure to backfill before making it NOT NULL in a follow-up migration.

*/
-- AlterTable
ALTER TABLE "public"."School" DROP COLUMN IF EXISTS "location",
ADD COLUMN     "cityId" UUID;

-- AddForeignKey
ALTER TABLE "public"."School" ADD CONSTRAINT "School_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
