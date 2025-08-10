import { PrismaClient, Difficulty, Board, QuizType, UserRole } from '../generated/prisma';

const prisma = new PrismaClient();

interface QuizConfig {
  title: string;
  description: string;
  difficulty: Difficulty;
  questionsPerQuiz: number;
}

const QUIZ_CONFIGS: QuizConfig[] = [
  {
    title: 'Easy Challenge Quiz',
    description: 'A beginner-friendly quiz with easy questions to build confidence',
    difficulty: 'EASY',
    questionsPerQuiz: 10
  },
  {
    title: 'Medium Challenge Quiz', 
    description: 'An intermediate quiz with medium difficulty questions for steady progress',
    difficulty: 'MEDIUM',
    questionsPerQuiz: 8
  },
  {
    title: 'Hard Challenge Quiz',
    description: 'An advanced quiz with challenging questions for expert learners',
    difficulty: 'HARD',
    questionsPerQuiz: 6
  }
];

async function createDifficultyBasedQuizzes() {
  console.log('🎯 Creating Difficulty-Based Quizzes\n');
  console.log('This script will:');
  console.log('1. Analyze existing questions by difficulty');
  console.log('2. Create 3 quizzes (Easy, Medium, Hard)');
  console.log('3. Distribute questions based on difficulty levels\n');

  try {
    // Step 1: Analyze existing questions
    console.log('📊 Analyzing existing questions...');
    const questionStats = await analyzeQuestions();
    
    if (questionStats.total === 0) {
      console.log('❌ No questions found in database. Please seed questions first.');
      return;
    }

    console.log(`   ✅ Found ${questionStats.total} total questions:`);
    console.log(`   - Easy: ${questionStats.easy} questions`);
    console.log(`   - Medium: ${questionStats.medium} questions`);
    console.log(`   - Hard: ${questionStats.hard} questions\n`);

    // Step 2: Create quizzes for each difficulty
    const createdQuizzes = [];
    
    for (const config of QUIZ_CONFIGS) {
      console.log(`🎯 Creating ${config.difficulty} quiz: "${config.title}"`);
      
      const quiz = await createQuizWithQuestions(config, questionStats);
      if (quiz) {
        createdQuizzes.push(quiz);
        console.log(`   ✅ Created quiz with ${quiz.questionCount} questions\n`);
      } else {
        console.log(`   ⚠️ Skipped ${config.difficulty} quiz - insufficient questions\n`);
      }
    }

    // Step 3: Display summary
    console.log('📋 Quiz Creation Summary:');
    console.log('=' .repeat(50));
    
    for (const quiz of createdQuizzes) {
      console.log(`📚 ${quiz.title}`);
      console.log(`   ID: ${quiz.id}`);
      console.log(`   Questions: ${quiz.questionCount}`);
      console.log(`   Difficulty: ${quiz.averageDifficulty}`);
      console.log(`   Estimated Time: ${quiz.estimatedTime} minutes`);
      console.log('');
    }

    console.log('🎉 Successfully created difficulty-based quizzes!');
    console.log(`📊 Total quizzes created: ${createdQuizzes.length}`);

  } catch (error) {
    console.error('❌ Error creating quizzes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function analyzeQuestions() {
  const [total, easy, medium, hard] = await Promise.all([
    prisma.quizQuestion.count(),
    prisma.quizQuestion.count({ where: { difficulty: 'EASY' } }),
    prisma.quizQuestion.count({ where: { difficulty: 'MEDIUM' } }),
    prisma.quizQuestion.count({ where: { difficulty: 'HARD' } })
  ]);

  return { total, easy, medium, hard };
}

async function createQuizWithQuestions(config: QuizConfig, stats: any) {
  // Check if we have enough questions for this difficulty
  const availableQuestions = stats[config.difficulty.toLowerCase()];
  
  if (availableQuestions < config.questionsPerQuiz) {
    console.log(`   ⚠️ Only ${availableQuestions} ${config.difficulty} questions available, need ${config.questionsPerQuiz}`);
    
    if (availableQuestions === 0) {
      return null;
    }
    
    console.log(`   📝 Creating quiz with ${availableQuestions} questions instead`);
  }

  // Get questions for this difficulty
  const questions = await prisma.quizQuestion.findMany({
    where: { difficulty: config.difficulty },
    take: Math.min(config.questionsPerQuiz, availableQuestions),
    include: {
      subject: true,
      chapter: true
    },
    orderBy: { createdAt: 'desc' }
  });

  if (questions.length === 0) {
    return null;
  }

  // Determine quiz metadata from questions
  const grades = [...new Set(questions.map(q => q.grade))];
  const boards = [...new Set(questions.map(q => q.board))];
  const subjects = [...new Set(questions.map(q => q.subjectId))];

  const primaryGrade = grades.length === 1 ? grades[0] : null;
  const primaryBoard = boards.length === 1 ? boards[0] : null;
  const primarySubjectId = subjects.length === 1 ? subjects[0] : null;

  // Calculate estimated time (2 minutes per question for easy, 3 for medium, 4 for hard)
  const timePerQuestion = config.difficulty === 'EASY' ? 2 : config.difficulty === 'MEDIUM' ? 3 : 4;
  const estimatedTime = questions.length * timePerQuestion;

  // Create the quiz
  const quiz = await prisma.quiz.create({
    data: {
      title: config.title,
      description: config.description,
      type: QuizType.SYSTEM,
      timeLimit: estimatedTime,
      createdById: 'system-admin',
      createdByRole: UserRole.ADMIN,
      isPublic: true,
      
      // Metadata
      primaryGrade,
      primaryBoard,
      primarySubjectId,
      hasMultipleGrades: grades.length > 1,
      hasMultipleBoards: boards.length > 1,
      hasMultipleSubjects: subjects.length > 1,
      questionCount: questions.length,
      averageDifficulty: config.difficulty,
      estimatedTime
    }
  });

  // Add questions to quiz
  const quizQuestions = questions.map((question, index) => ({
    quizId: quiz.id,
    questionId: question.id,
    order: index + 1,
    points: config.difficulty === 'EASY' ? 1 : config.difficulty === 'MEDIUM' ? 2 : 3
  }));

  await prisma.quizToQuestion.createMany({
    data: quizQuestions
  });

  console.log(`   📝 Added ${questions.length} questions to quiz`);
  console.log(`   📊 Grade distribution: ${grades.join(', ')}`);
  console.log(`   📚 Board distribution: ${boards.join(', ')}`);
  console.log(`   🎯 Subject count: ${subjects.length}`);

  return quiz;
}

// Additional utility function to get quiz details
async function getQuizDetails(quizId: string) {
  return await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          question: {
            include: {
              subject: true,
              chapter: true
            }
          }
        },
        orderBy: { order: 'asc' }
      },
      tags: true
    }
  });
}

// Function to display quiz statistics
async function displayQuizStatistics() {
  console.log('\n📊 Current Quiz Statistics:');
  console.log('=' .repeat(40));

  const quizzes = await prisma.quiz.findMany({
    where: { type: QuizType.SYSTEM },
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });

  for (const quiz of quizzes) {
    const difficulties = quiz.questions.map(q => q.question.difficulty);
    const difficultyCount = {
      EASY: difficulties.filter(d => d === 'EASY').length,
      MEDIUM: difficulties.filter(d => d === 'MEDIUM').length,
      HARD: difficulties.filter(d => d === 'HARD').length
    };

    console.log(`\n📚 ${quiz.title}`);
    console.log(`   Questions: ${quiz.questionCount}`);
    console.log(`   Difficulty breakdown: Easy(${difficultyCount.EASY}) Medium(${difficultyCount.MEDIUM}) Hard(${difficultyCount.HARD})`);
    console.log(`   Time limit: ${quiz.timeLimit} minutes`);
    console.log(`   Public: ${quiz.isPublic ? 'Yes' : 'No'}`);
  }
}

// Run the script
if (require.main === module) {
  createDifficultyBasedQuizzes()
    .then(() => {
      console.log('\n🔍 Displaying final statistics...');
      return displayQuizStatistics();
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { 
  createDifficultyBasedQuizzes, 
  getQuizDetails, 
  displayQuizStatistics 
};