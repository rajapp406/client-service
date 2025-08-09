/*
  Warnings:

  - You are about to drop the column `studentId` on the `QuizAttempt` table. All the data in the column will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userProfileId` to the `QuizAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."QuizAttempt" DROP CONSTRAINT "QuizAttempt_studentId_fkey";

-- DropIndex
DROP INDEX "public"."QuizAttempt_status_idx";

-- DropIndex
DROP INDEX "public"."QuizAttempt_studentId_completedAt_idx";

-- DropIndex
DROP INDEX "public"."QuizAttempt_studentId_idx";

-- AlterTable
ALTER TABLE "public"."QuizAttempt" DROP COLUMN "studentId",
ADD COLUMN     "userProfileId" UUID NOT NULL;

-- DropTable
DROP TABLE "public"."Student";

-- CreateIndex
CREATE INDEX "QuizAttempt_userProfileId_idx" ON "public"."QuizAttempt"("userProfileId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userProfileId_completedAt_idx" ON "public"."QuizAttempt"("userProfileId", "completedAt");

-- AddForeignKey
ALTER TABLE "public"."QuizAttempt" ADD CONSTRAINT "QuizAttempt_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
