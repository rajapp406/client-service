const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function testEnhancedQuizAttempts() {
  console.log('🧪 Testing Enhanced Quiz Attempts API\n');

  try {
    // Get a quiz with attempts for testing
    const quiz = await prisma.quiz.findFirst({
      include: {
        attempts: true,
        questions: {
          include: {
            question: true
          }
        }
      }
    });

    if (!quiz || quiz.attempts.length === 0) {
      console.log('❌ No quiz with attempts found for testing');
      return;
    }

    console.log(`📚 Testing with Quiz: "${quiz.title}"`);
    console.log(`   Questions: ${quiz.questions.length}`);
    console.log(`   Attempts: ${quiz.attempts.length}\n`);

    // Test 1: Basic quiz attempts (no includes)
    console.log('📝 Test 1: Basic quiz attempts (no includes)...');
    const basicAttempts = await prisma.quizAttempt.findMany({
      where: { quizId: quiz.id },
      orderBy: { startedAt: 'desc' }
    });

    console.log(`   ✅ Found ${basicAttempts.length} attempts`);
    basicAttempts.forEach((attempt, index) => {
      console.log(`      ${index + 1}. User: ${attempt.userId} - Status: ${attempt.status}`);
    });

    // Test 2: Include quiz information only
    console.log('\n📊 Test 2: Include quiz information...');
    const attemptsWithQuiz = await prisma.quizAttempt.findMany({
      where: { quizId: quiz.id },
      orderBy: { startedAt: 'desc' },
      include: {
        quiz: {
          include: {
            tags: true
          }
        }
      }
    });

    console.log(`   ✅ Found ${attemptsWithQuiz.length} attempts with quiz info`);
    if (attemptsWithQuiz.length > 0) {
      const firstAttempt = attemptsWithQuiz[0];
      console.log(`      Quiz Title: ${firstAttempt.quiz.title}`);
      console.log(`      Quiz Type: ${firstAttempt.quiz.type}`);
      console.log(`      Question Count: ${firstAttempt.quiz.questionCount}`);
      console.log(`      Time Limit: ${firstAttempt.quiz.timeLimit} minutes`);
      console.log(`      Tags: ${firstAttempt.quiz.tags?.length || 0}`);
    }

    // Test 3: Include quiz with questions
    console.log('\n🎯 Test 3: Include quiz with questions...');
    const attemptsWithQuestions = await prisma.quizAttempt.findMany({
      where: { quizId: quiz.id },
      orderBy: { startedAt: 'desc' },
      include: {
        quiz: {
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
        }
      }
    });

    console.log(`   ✅ Found ${attemptsWithQuestions.length} attempts with questions`);
    if (attemptsWithQuestions.length > 0) {
      const firstAttempt = attemptsWithQuestions[0];
      console.log(`      Quiz: ${firstAttempt.quiz.title}`);
      console.log(`      Questions: ${firstAttempt.quiz.questions?.length || 0}`);
      
      if (firstAttempt.quiz.questions && firstAttempt.quiz.questions.length > 0) {
        const firstQuestion = firstAttempt.quiz.questions[0];
        console.log(`      First Question:`);
        console.log(`        Order: ${firstQuestion.order}`);
        console.log(`        Points: ${firstQuestion.points}`);
        console.log(`        Text: ${firstQuestion.question.questionText.substring(0, 60)}...`);
        console.log(`        Type: ${firstQuestion.question.questionType}`);
        console.log(`        Difficulty: ${firstQuestion.question.difficulty}`);
        console.log(`        Subject: ${firstQuestion.question.subject?.name}`);
        console.log(`        Chapter: ${firstQuestion.question.chapter?.title}`);
      }
    }

    // Test 4: Include answers
    console.log('\n✍️ Test 4: Include answers...');
    const attemptsWithAnswers = await prisma.quizAttempt.findMany({
      where: { quizId: quiz.id },
      orderBy: { startedAt: 'desc' },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    console.log(`   ✅ Found ${attemptsWithAnswers.length} attempts with answers`);
    attemptsWithAnswers.forEach((attempt, index) => {
      console.log(`      ${index + 1}. User: ${attempt.userId} - Answers: ${attempt.answers?.length || 0}`);
      if (attempt.answers && attempt.answers.length > 0) {
        const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
        console.log(`         Correct: ${correctAnswers}/${attempt.answers.length}`);
      }
    });

    // Test 5: Full data (quiz + questions + answers)
    console.log('\n🎯 Test 5: Full data (quiz + questions + answers)...');
    const fullAttempts = await prisma.quizAttempt.findMany({
      where: { quizId: quiz.id },
      orderBy: { startedAt: 'desc' },
      include: {
        quiz: {
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
        },
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    console.log(`   ✅ Found ${fullAttempts.length} attempts with full data`);
    if (fullAttempts.length > 0) {
      const attempt = fullAttempts[0];
      console.log(`      Complete Data Structure:`);
      console.log(`        Quiz: ${attempt.quiz.title} (${attempt.quiz.questions?.length} questions)`);
      console.log(`        Answers: ${attempt.answers?.length || 0} submitted`);
      console.log(`        Status: ${attempt.status}`);
      console.log(`        Score: ${attempt.score || 'N/A'}%`);
    }

    // Test 6: Performance comparison
    console.log('\n⚡ Test 6: Performance comparison...');
    
    const startBasic = Date.now();
    await prisma.quizAttempt.findMany({
      where: { quizId: quiz.id }
    });
    const basicTime = Date.now() - startBasic;

    const startFull = Date.now();
    await prisma.quizAttempt.findMany({
      where: { quizId: quiz.id },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    subject: true,
                    chapter: true
                  }
                }
              }
            },
            tags: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      }
    });
    const fullTime = Date.now() - startFull;

    console.log(`   ⚡ Basic query: ${basicTime}ms`);
    console.log(`   ⚡ Full query: ${fullTime}ms`);
    console.log(`   📊 Overhead: ${fullTime - basicTime}ms (${((fullTime / basicTime - 1) * 100).toFixed(1)}% increase)`);

    console.log('\n🎉 All enhanced quiz attempts tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testEnhancedQuizAttempts()
    .catch((error) => {
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testEnhancedQuizAttempts };