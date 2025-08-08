-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."QuizType" AS ENUM ('SYSTEM', 'USER_CREATED', 'CHAPTER', 'SUBJECT', 'MIXED', 'EXAM_SHEET');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'FILL_BLANK');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "public"."Board" AS ENUM ('CBSE', 'ICSE', 'IB', 'STATE', 'CAMBRIDGE');

-- CreateEnum
CREATE TYPE "public"."AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'PAUSED');

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "board" "public"."Board" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "board" "public"."Board" NOT NULL,
    "iconUrl" TEXT,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chapter" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subjectId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "chapterNumber" INTEGER,
    "content" TEXT,
    "youtubeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizQuestion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chapterId" UUID,
    "subjectId" UUID NOT NULL,
    "grade" INTEGER NOT NULL,
    "board" "public"."Board" NOT NULL,
    "questionType" "public"."QuestionType" NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quiz" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."QuizType" NOT NULL DEFAULT 'USER_CREATED',
    "timeLimit" INTEGER,
    "createdById" TEXT NOT NULL,
    "createdByRole" "public"."UserRole" NOT NULL DEFAULT 'ADMIN',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "primaryGrade" INTEGER,
    "primaryBoard" "public"."Board",
    "primarySubjectId" UUID,
    "hasMultipleGrades" BOOLEAN NOT NULL DEFAULT false,
    "hasMultipleBoards" BOOLEAN NOT NULL DEFAULT false,
    "hasMultipleSubjects" BOOLEAN NOT NULL DEFAULT false,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "averageDifficulty" TEXT,
    "estimatedTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizToQuestion" (
    "quizId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuizToQuestion_pkey" PRIMARY KEY ("quizId","questionId")
);

-- CreateTable
CREATE TABLE "public"."QuizTag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quizId" UUID NOT NULL,
    "tag" VARCHAR(50) NOT NULL,

    CONSTRAINT "QuizTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizAttempt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quizId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,
    "score" DOUBLE PRECISION,
    "totalQuestions" INTEGER,
    "correctAnswers" INTEGER,
    "totalPoints" INTEGER,
    "maxPoints" INTEGER,
    "status" "public"."AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizAnswer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quizAttemptId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "selectedOption" TEXT,
    "textAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE INDEX "Student_userId_idx" ON "public"."Student"("userId");

-- CreateIndex
CREATE INDEX "Student_grade_board_idx" ON "public"."Student"("grade", "board");

-- CreateIndex
CREATE INDEX "Subject_grade_board_idx" ON "public"."Subject"("grade", "board");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_grade_board_key" ON "public"."Subject"("name", "grade", "board");

-- CreateIndex
CREATE INDEX "Chapter_subjectId_idx" ON "public"."Chapter"("subjectId");

-- CreateIndex
CREATE INDEX "Chapter_subjectId_chapterNumber_idx" ON "public"."Chapter"("subjectId", "chapterNumber");

-- CreateIndex
CREATE INDEX "QuizQuestion_chapterId_idx" ON "public"."QuizQuestion"("chapterId");

-- CreateIndex
CREATE INDEX "QuizQuestion_subjectId_idx" ON "public"."QuizQuestion"("subjectId");

-- CreateIndex
CREATE INDEX "QuizQuestion_grade_board_idx" ON "public"."QuizQuestion"("grade", "board");

-- CreateIndex
CREATE INDEX "QuizQuestion_difficulty_idx" ON "public"."QuizQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "Quiz_type_idx" ON "public"."Quiz"("type");

-- CreateIndex
CREATE INDEX "Quiz_createdById_idx" ON "public"."Quiz"("createdById");

-- CreateIndex
CREATE INDEX "Quiz_createdByRole_idx" ON "public"."Quiz"("createdByRole");

-- CreateIndex
CREATE INDEX "Quiz_isPublic_idx" ON "public"."Quiz"("isPublic");

-- CreateIndex
CREATE INDEX "Quiz_primaryGrade_primaryBoard_idx" ON "public"."Quiz"("primaryGrade", "primaryBoard");

-- CreateIndex
CREATE INDEX "Quiz_primarySubjectId_idx" ON "public"."Quiz"("primarySubjectId");

-- CreateIndex
CREATE INDEX "Quiz_createdAt_idx" ON "public"."Quiz"("createdAt");

-- CreateIndex
CREATE INDEX "QuizToQuestion_questionId_idx" ON "public"."QuizToQuestion"("questionId");

-- CreateIndex
CREATE INDEX "QuizToQuestion_quizId_order_idx" ON "public"."QuizToQuestion"("quizId", "order");

-- CreateIndex
CREATE INDEX "QuizTag_tag_idx" ON "public"."QuizTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "QuizTag_quizId_tag_key" ON "public"."QuizTag"("quizId", "tag");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_idx" ON "public"."QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_studentId_idx" ON "public"."QuizAttempt"("studentId");

-- CreateIndex
CREATE INDEX "QuizAttempt_startedAt_idx" ON "public"."QuizAttempt"("startedAt");

-- CreateIndex
CREATE INDEX "QuizAttempt_status_idx" ON "public"."QuizAttempt"("status");

-- CreateIndex
CREATE INDEX "QuizAttempt_studentId_completedAt_idx" ON "public"."QuizAttempt"("studentId", "completedAt");

-- CreateIndex
CREATE INDEX "QuizAnswer_quizAttemptId_idx" ON "public"."QuizAnswer"("quizAttemptId");

-- CreateIndex
CREATE INDEX "QuizAnswer_questionId_idx" ON "public"."QuizAnswer"("questionId");

-- CreateIndex
CREATE INDEX "QuizAnswer_isCorrect_idx" ON "public"."QuizAnswer"("isCorrect");

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizQuestion" ADD CONSTRAINT "QuizQuestion_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizQuestion" ADD CONSTRAINT "QuizQuestion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_primarySubjectId_fkey" FOREIGN KEY ("primarySubjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizToQuestion" ADD CONSTRAINT "QuizToQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizToQuestion" ADD CONSTRAINT "QuizToQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizTag" ADD CONSTRAINT "QuizTag_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "public"."QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
