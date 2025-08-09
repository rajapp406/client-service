/*
  Warnings:

  - You are about to drop the column `locationId` on the `UserProfile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserProfile" DROP CONSTRAINT "UserProfile_locationId_fkey";

-- AlterTable
ALTER TABLE "public"."UserProfile" DROP COLUMN "locationId";
