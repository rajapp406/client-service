-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('STUDENT', 'TEACHER', 'PARENT', 'ADMIN');

-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'PARENT';

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "userType" "public"."UserType" NOT NULL,
    "schoolId" UUID,
    "locationId" UUID NOT NULL,
    "grade" INTEGER,
    "board" "public"."Board",
    "dateOfBirth" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "parentEmail" TEXT,
    "parentPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserInterest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profileId" UUID NOT NULL,
    "interest" TEXT NOT NULL,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_schoolId_idx" ON "public"."UserProfile"("schoolId");

-- CreateIndex
CREATE INDEX "UserProfile_grade_board_idx" ON "public"."UserProfile"("grade", "board");

-- CreateIndex
CREATE INDEX "UserInterest_profileId_idx" ON "public"."UserInterest"("profileId");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInterest" ADD CONSTRAINT "UserInterest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
