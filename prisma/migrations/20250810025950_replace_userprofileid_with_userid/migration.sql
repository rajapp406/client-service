/*
  Warnings:

  - You are about to drop the column `userProfileId` on the `QuizAttempt` table. All the data in the column will be lost.
  - Added the required column `userId` to the `QuizAttempt` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add the new userId column as nullable first
ALTER TABLE "public"."QuizAttempt" ADD COLUMN "userId" TEXT;

-- Step 2: Populate userId with data from UserProfile table
UPDATE "public"."QuizAttempt" 
SET "userId" = "public"."UserProfile"."userId"
FROM "public"."UserProfile"
WHERE "public"."QuizAttempt"."userProfileId" = "public"."UserProfile"."id";

-- Step 3: Make userId NOT NULL after data is populated
ALTER TABLE "public"."QuizAttempt" ALTER COLUMN "userId" SET NOT NULL;

-- Step 4: Drop the foreign key constraint
ALTER TABLE "public"."QuizAttempt" DROP CONSTRAINT "QuizAttempt_userProfileId_fkey";

-- Step 5: Drop old indexes
DROP INDEX "public"."QuizAttempt_userProfileId_completedAt_idx";
DROP INDEX "public"."QuizAttempt_userProfileId_idx";

-- Step 6: Drop the old userProfileId column
ALTER TABLE "public"."QuizAttempt" DROP COLUMN "userProfileId";

-- Step 7: Create new indexes
CREATE INDEX "QuizAttempt_userId_idx" ON "public"."QuizAttempt"("userId");
CREATE INDEX "QuizAttempt_userId_completedAt_idx" ON "public"."QuizAttempt"("userId", "completedAt");
