/*
  Warnings:

  - You are about to alter the column `code` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `VarChar(3)`.
  - You are about to drop the column `cityId` on the `School` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,countryId]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `countryId` to the `City` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `Country` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."City" DROP CONSTRAINT "City_stateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."School" DROP CONSTRAINT "School_cityId_fkey";

-- DropIndex
DROP INDEX "public"."City_name_stateId_key";

-- DropIndex
DROP INDEX "public"."City_stateId_idx";

-- DropIndex
DROP INDEX "public"."Country_name_idx";

-- AlterTable
ALTER TABLE "public"."City" ADD COLUMN     "code" VARCHAR(10),
ADD COLUMN     "countryId" UUID NOT NULL,
ALTER COLUMN "stateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Country" ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "code" SET DATA TYPE VARCHAR(3);

-- AlterTable
ALTER TABLE "public"."School" DROP COLUMN "cityId";

-- AlterTable
ALTER TABLE "public"."UserProfile" ADD COLUMN     "cityId" UUID,
ADD COLUMN     "schoolBranchId" UUID;

-- CreateTable
CREATE TABLE "public"."SchoolBranch" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "schoolId" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "address" TEXT,

    CONSTRAINT "SchoolBranch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolBranch_schoolId_cityId_key" ON "public"."SchoolBranch"("schoolId", "cityId");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "public"."City"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_countryId_key" ON "public"."City"("name", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "School_name_key" ON "public"."School"("name");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_schoolBranchId_fkey" FOREIGN KEY ("schoolBranchId") REFERENCES "public"."SchoolBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolBranch" ADD CONSTRAINT "SchoolBranch_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolBranch" ADD CONSTRAINT "SchoolBranch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE SET NULL ON UPDATE CASCADE;
