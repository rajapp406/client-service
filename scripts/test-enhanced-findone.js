const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function testEnhancedFindOne() {
  console.log('🧪 Testing Enhanced FindOne Quiz Attempt API\n');

  try {
    // Get a quiz attempt for testing
    const attempt = await prisma.quizAttempt.findFirst({
      include: {
        quiz: true,
        answers: true
      }
    });

    if (!attempt) {
      console.log('❌ No quiz attempt found for testing');
      return;
    }

    console.log(`📝 Testing with Quiz Attempt: ${attempt.id}`);
    console.log(`   Quiz: ${attempt.quiz.title}`);
    console.log(`   Status: ${attempt.status}`);
    console.log(`   User: ${attempt.userId}`);
    console.log(`   Answers: ${attempt.answers?.length || 0}\n`);

    // Test 1: Basic quiz attempt (no includes)
    console.log('📝 Test 1: Basic quiz attempt (no includes)...');
    const basicAttempt = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id }
    });

    console.log(`   ✅ Found attempt: ${basicAttempt.id}`);
    console.log(`      Status: ${basicAttempt.status}`);
    console.log(`      Score: ${basicAttempt.score || 'N/A'}%`);
    console.log(`      Time Spent: ${basicAttempt.timeSpent || 'N/A'} seconds`);

    // Test 2: Include quiz information only
    console.log('\n📊 Test 2: Include quiz information...');
    const attemptWithQuiz = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
      include: {
        quiz: {
          include: {
            tags: true
          }
        }
      }
    });

    console.log(`   ✅ Found attempt with quiz info`);
    console.log(`      Quiz Title: ${attemptWithQuiz.quiz.title}`);
    console.log(`      Quiz Type: ${attemptWithQuiz.quiz.type}`);
    console.log(`      Question Count: ${attemptWithQuiz.quiz.questionCount}`);
    console.log(`      Time Limit: ${attemptWithQuiz.quiz.timeLimit} minutes`);
    console.log(`      Average Difficulty: ${attemptWithQuiz.quiz.averageDifficulty}`);
    console.log(`      Tags: ${attemptWithQuiz.quiz.tags?.length || 0}`);

    // Test 3: Include quiz with questions
    console.log('\n🎯 Test 3: Include quiz with questions...');
    const attemptWithQuestions = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
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

    console.log(`   ✅ Found attempt with questions`);
    console.log(`      Quiz: ${attemptWithQuestions.quiz.title}`);
    console.log(`      Questions: ${attemptWithQuestions.quiz.questions?.length || 0}`);
    
    if (attemptWithQuestions.quiz.questions && attemptWithQuestions.quiz.questions.length > 0) {
      console.log(`      Question Details:`);
      attemptWithQuestions.quiz.questions.forEach((q, index) => {
        console.log(`        ${index + 1}. Order: ${q.order}, Points: ${q.points}`);
        console.log(`           Text: ${q.question.questionText.substring(0, 50)}...`);
        console.log(`           Type: ${q.question.questionType}, Difficulty: ${q.question.difficulty}`);
        console.log(`           Subject: ${q.question.subject?.name}`);
        console.log(`           Chapter: ${q.question.chapter?.title}`);
      });
    }

    // Test 4: Include answers
    console.log('\n✍️ Test 4: Include answers...');
    const attemptWithAnswers = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    console.log(`   ✅ Found attempt with answers`);
    console.log(`      Answers: ${attemptWithAnswers.answers?.length || 0}`);
    
    if (attemptWithAnswers.answers && attemptWithAnswers.answers.length > 0) {
      const correctAnswers = attemptWithAnswers.answers.filter(a => a.isCorrect).length;
      console.log(`      Correct: ${correctAnswers}/${attemptWithAnswers.answers.length}`);
      
      console.log(`      Answer Details:`);
      attemptWithAnswers.answers.forEach((answer, index) => {
        console.log(`        ${index + 1}. Question: ${answer.question.questionText.substring(0, 40)}...`);
        console.log(`           Selected: ${answer.selectedOption || answer.textAnswer || 'N/A'}`);
        console.log(`           Correct: ${answer.isCorrect ? 'Yes' : 'No'}`);
        console.log(`           Points: ${answer.pointsEarned}`);
        console.log(`           Time: ${answer.timeSpent || 'N/A'} seconds`);
      });
    }

    // Test 5: Full data (quiz + questions + answers)
    console.log('\n🎯 Test 5: Full data (quiz + questions + answers)...');
    const fullAttempt = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
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

    console.log(`   ✅ Found attempt with full data`);
    console.log(`      Complete Data Structure:`);
    console.log(`        Quiz: ${fullAttempt.quiz.title} (${fullAttempt.quiz.questions?.length} questions)`);
    console.log(`        Answers: ${fullAttempt.answers?.length || 0} submitted`);
    console.log(`        Status: ${fullAttempt.status}`);
    console.log(`        Score: ${fullAttempt.score || 'N/A'}%`);
    console.log(`        Time Spent: ${fullAttempt.timeSpent || 'N/A'} seconds`);

    // Test 6: Performance comparison
    console.log('\n⚡ Test 6: Performance comparison...');
    
    const startBasic = Date.now();
    await prisma.quizAttempt.findUnique({
      where: { id: attempt.id }
    });
    const basicTime = Date.now() - startBasic;

    const startFull = Date.now();
    await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
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

    // Test 7: API Usage Examples
    console.log('\n📚 Test 7: API Usage Examples...');
    console.log('   Example API calls:');
    console.log(`   GET /quiz-attempts/${attempt.id} - Basic attempt info`);
    console.log(`   GET /quiz-attempts/${attempt.id}?includeQuiz=true - With quiz info`);
    console.log(`   GET /quiz-attempts/${attempt.id}?includeQuiz=true&includeQuestions=true - With questions`);
    console.log(`   GET /quiz-attempts/${attempt.id}?includeAnswers=true - With answers`);
    console.log(`   GET /quiz-attempts/${attempt.id}?includeQuiz=true&includeQuestions=true&includeAnswers=true - Full data`);

    console.log('\n🎉 All enhanced findOne tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testEnhancedFindOne()
    .catch((error) => {
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testEnhancedFindOne };