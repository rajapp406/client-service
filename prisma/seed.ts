// Import Prisma client and types
import { PrismaClient, UserRole, QuizType, QuestionType, Difficulty, Board, AttemptStatus } from '../generated/prisma';
import type { Prisma, Chapter, QuizQuestion } from '../generated/prisma';

// Create a new Prisma client instance
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizToQuestion.deleteMany();
  await prisma.quizTag.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();

  // Create a sample student
  console.log('Creating sample student...');
  const student = await prisma.student.create({
    data: {
      userId: 'student-1',
      grade: 10,
      board: 'CBSE' as const,
    },
  });

  // Create sample subjects
  console.log('Creating sample subjects...');
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Mathematics',
        grade: 10,
        board: 'CBSE' as const,
        iconUrl: 'https://example.com/math-icon.png',
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Science',
        grade: 10,
        board: 'CBSE' as const,
        iconUrl: 'https://example.com/science-icon.png',
      },
    }),
  ]);

  // Create chapters for each subject
  console.log('Creating sample chapters...');
    const chapters: Chapter[] = [];
  for (const subject of subjects) {
    const subjectChapters = await Promise.all(
      Array(3).fill(0).map((_, i) => {
        const chapterData: Prisma.ChapterCreateInput = {
          subject: {
            connect: { id: subject.id }
          },
          title: `${subject.name} Chapter ${i + 1}`,
          chapterNumber: i + 1,
          content: `This is the content for ${subject.name} Chapter ${i + 1}`,
          youtubeUrl: `https://youtube.com/${subject.name.toLowerCase()}-chapter-${i + 1}`,
        };
        return prisma.chapter.create({
          data: chapterData,
        });
      })
    );
    chapters.push(...subjectChapters);
  }

  // Create quiz questions
  console.log('Creating sample questions...');
  const questions:QuizQuestion[] = [];
  for (const chapter of chapters) {
    const subject = subjects.find(s => s.id === chapter.subjectId);
    if (!subject) continue;

    const chapterQuestions = await Promise.all(
      Array(5).fill(0).map((_, i) => {
        const options = ['Option A', 'Option B', 'Option C', 'Option D'];
        const questionData: Prisma.QuizQuestionCreateInput = {
          chapter: {
            connect: { id: chapter.id }
          },
          subject: {
            connect: { id: subject.id }
          },
          grade: subject.grade,
          board: subject.board,
          questionType: 'MCQ' as const,
          questionText: `Sample question ${i + 1} for ${chapter.title}`,
          options: options,
          correctAnswer: '0', // Index of correct answer
          explanation: `Explanation for question ${i + 1}`,
          difficulty: (['EASY', 'MEDIUM', 'HARD'] as const)[i % 3],
        };
        
        return prisma.quizQuestion.create({
          data: questionData
        });
      })
    );
    questions.push(...chapterQuestions);
  }

  // Create a sample quiz
  console.log('Creating sample quizzes...');
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Sample Quiz 1',
      description: 'A sample quiz with questions from multiple chapters',
      type: 'USER_CREATED' as const,
      createdById: 'teacher-1',
      createdByRole: 'TEACHER' as const,
      isPublic: true,
      primaryGrade: 10,
      primaryBoard: 'CBSE' as const,
      primarySubjectId: subjects[0].id,
      questionCount: 5,
      averageDifficulty: 'MEDIUM' as const,
      estimatedTime: 30,
      questions: {
        create: questions.slice(0, 5).map((q, i) => ({
          questionId: q.id,
          order: i + 1,
          points: 1,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  // Create a quiz attempt
  console.log('Creating sample quiz attempt...');
  const quizAttempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      studentId: student.id,
      status: 'COMPLETED' as const,
      startedAt: new Date(Date.now() - 3600000), // 1 hour ago
      completedAt: new Date(),
      timeSpent: 1800, // 30 minutes in seconds
      score: 80, // 80%
      totalQuestions: 5,
      correctAnswers: 4,
      totalPoints: 5,
      maxPoints: 5,
      answers: {
        create: quiz.questions.map((q, i) => ({
          questionId: q.questionId,
          selectedOption: i === 0 ? '1' : '0', // First answer is wrong, others are correct
          isCorrect: i !== 0,
          pointsEarned: i !== 0 ? 1 : 0,
          timeSpent: 30 + i * 10, // Vary time spent
        })),
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Created ${subjects.length} subjects`);
  console.log(`Created ${chapters.length} chapters`);
  console.log(`Created ${questions.length} questions`);
  console.log(`Created 1 quiz with ${quiz.questions.length} questions`);
  console.log(`Created 1 quiz attempt with ${quiz.questions.length} answers`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
