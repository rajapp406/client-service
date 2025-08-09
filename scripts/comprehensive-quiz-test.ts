import { PrismaClient } from '../generated/prisma';
import axios from 'axios';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function comprehensiveQuizTest() {
  console.log('🧪 Comprehensive Quiz Answer System Test\n');
  console.log('This test demonstrates:');
  console.log('1. Direct database quiz attempt workflow');
  console.log('2. API endpoint testing');
  console.log('3. Answer validation and scoring');
  console.log('4. Bulk answer submission');
  console.log('5. Quiz completion and statistics\n');

  try {
    // Part 1: Database Workflow Test
    console.log('=' .repeat(60));
    console.log('🗄️  PART 1: DIRECT DATABASE WORKFLOW TEST');
    console.log('=' .repeat(60));

    await testDatabaseWorkflow();

    // Part 2: API Endpoint Test
    console.log('\n' + '=' .repeat(60));
    console.log('🌐 PART 2: API ENDPOINT TEST');
    console.log('=' .repeat(60));

    await testAPIEndpoints();

    // Part 3: Advanced Scenarios
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 PART 3: ADVANCED SCENARIOS TEST');
    console.log('=' .repeat(60));

    await testAdvancedScenarios();

    console.log('\n' + '🎉'.repeat(20));
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉');
    console.log('🎉'.repeat(20));

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function testDatabaseWorkflow() {
  console.log('📊 Checking database state...');
  
  // Get existing data
  const [quizzes, students, questions] = await Promise.all([
    prisma.quiz.findMany({
      include: {
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' }
        }
      }
    }),
    prisma.student.findMany(),
    prisma.quizQuestion.findMany({ take: 3 })
  ]);

  console.log(`   ✅ Found ${quizzes.length} quizzes, ${students.length} students, ${questions.length} questions`);

  if (quizzes.length === 0) {
    console.log('❌ No quizzes found. Please seed the database first.');
    return;
  }

  // Ensure we have a student
  let student = students[0];
  if (!student) {
    console.log('📝 Creating test student...');
    student = await prisma.student.create({
      data: {
        userId: `test-student-${Date.now()}`,
        grade: 10,
        board: 'CBSE'
      }
    });
    console.log(`   ✅ Created student: ${student.id}`);
  }

  const quiz = quizzes[0];
  console.log(`\n🎯 Testing with Quiz: "${quiz.title}" (${quiz.questions.length} questions)`);

  // Create quiz attempt
  console.log('\n🚀 Creating quiz attempt...');
  const quizAttempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      studentId: student.id,
      status: 'IN_PROGRESS'
    }
  });
  console.log(`   ✅ Created attempt: ${quizAttempt.id}`);

  // Submit answers with different scenarios
  console.log('\n✍️ Submitting answers with mixed results...');
  const answerResults = [];

  for (let i = 0; i < quiz.questions.length; i++) {
    const quizQuestion = quiz.questions[i];
    const question = quizQuestion.question;
    
    console.log(`\n   📝 Question ${i + 1}: ${question.questionText.substring(0, 60)}...`);
    
    const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options as string);
    const correctOption = options.find((opt: any) => opt.isCorrect);
    
    // Simulate different answer scenarios
    let selectedAnswer;
    let isIntentionallyCorrect;
    
    if (i === 0) {
      // First question: correct answer
      selectedAnswer = correctOption?.text;
      isIntentionallyCorrect = true;
      console.log(`   ✅ Submitting CORRECT answer: ${selectedAnswer}`);
    } else if (i === 1) {
      // Second question: wrong answer
      const wrongOptions = options.filter((opt: any) => !opt.isCorrect);
      selectedAnswer = wrongOptions[0]?.text;
      isIntentionallyCorrect = false;
      console.log(`   ❌ Submitting WRONG answer: ${selectedAnswer}`);
    } else {
      // Random for others
      isIntentionallyCorrect = Math.random() > 0.5;
      selectedAnswer = isIntentionallyCorrect ? correctOption?.text : options.find((opt: any) => !opt.isCorrect)?.text;
      console.log(`   ${isIntentionallyCorrect ? '✅' : '❌'} Submitting ${isIntentionallyCorrect ? 'CORRECT' : 'WRONG'} answer: ${selectedAnswer}`);
    }

    // Create answer record
    const answer = await prisma.quizAnswer.create({
      data: {
        quizAttemptId: quizAttempt.id,
        questionId: question.id,
        selectedOption: selectedAnswer,
        isCorrect: selectedAnswer === correctOption?.text,
        pointsEarned: selectedAnswer === correctOption?.text ? quizQuestion.points : 0,
        timeSpent: Math.floor(Math.random() * 60) + 10,
        answeredAt: new Date()
      }
    });

    answerResults.push(answer);
    console.log(`   💾 Saved: ${answer.isCorrect ? 'Correct' : 'Wrong'} (${answer.pointsEarned} points)`);
  }

  // Calculate and update final score
  console.log('\n🧮 Calculating final score...');
  const totalQuestions = answerResults.length;
  const correctAnswers = answerResults.filter(a => a.isCorrect).length;
  const totalPoints = answerResults.reduce((sum, a) => sum + a.pointsEarned, 0);
  const maxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const score = (correctAnswers / totalQuestions) * 100;

  const completedAttempt = await prisma.quizAttempt.update({
    where: { id: quizAttempt.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      score: Math.round(score * 100) / 100,
      totalQuestions,
      correctAnswers,
      totalPoints,
      maxPoints,
      timeSpent: answerResults.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
    }
  });

  console.log(`   📊 Final Results:`);
  console.log(`   - Score: ${completedAttempt.score}% (${correctAnswers}/${totalQuestions})`);
  console.log(`   - Points: ${totalPoints}/${maxPoints}`);
  console.log(`   - Time: ${completedAttempt.timeSpent} seconds`);
  console.log(`   ✅ Database workflow completed successfully!`);
}

async function testAPIEndpoints() {
  console.log('🌐 Testing API endpoints...');
  
  try {
    // Check if server is running
    await axios.get(`${BASE_URL}/health`).catch(() => {
      throw new Error('Server not running. Please start the server with: npm run start:dev');
    });

    // Get data for testing
    const [quizzesResponse, studentsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/quizzes`),
      axios.get(`${BASE_URL}/students`)
    ]);

    const quizzes = quizzesResponse.data;
    const students = studentsResponse.data;

    if (quizzes.length === 0 || students.length === 0) {
      console.log('⚠️ Skipping API tests - insufficient data');
      return;
    }

    const quiz = quizzes[0];
    const student = students[0];

    console.log(`   🎯 Using Quiz: "${quiz.title}"`);

    // Test 1: Create quiz attempt
    console.log('\n📝 Test 1: Creating quiz attempt via API...');
    const attemptResponse = await axios.post(`${BASE_URL}/quiz-attempts`, {
      quizId: quiz.id,
      studentId: student.id
    });
    const attempt = attemptResponse.data;
    console.log(`   ✅ Created attempt: ${attempt.id}`);

    // Test 2: Submit individual answer
    console.log('\n📝 Test 2: Submitting individual answer...');
    const quizDetailsResponse = await axios.get(`${BASE_URL}/quizzes/${quiz.id}?includeQuestions=true`);
    const quizWithQuestions = quizDetailsResponse.data;
    
    if (quizWithQuestions.questions && quizWithQuestions.questions.length > 0) {
      const firstQuestion = quizWithQuestions.questions[0].question;
      const options = Array.isArray(firstQuestion.options) ? firstQuestion.options : JSON.parse(firstQuestion.options);
      const correctOption = options.find((opt: any) => opt.isCorrect);

      const answerResponse = await axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
        quizAttemptId: attempt.id,
        questionId: firstQuestion.id,
        selectedOption: correctOption.text,
        timeSpent: 30
      });

      console.log(`   ✅ Answer submitted: ${answerResponse.data.isCorrect ? 'Correct' : 'Wrong'}`);
    }

    // Test 3: Get current score
    console.log('\n📝 Test 3: Getting current score...');
    const scoreResponse = await axios.get(`${BASE_URL}/quiz-attempts/${attempt.id}/score`);
    console.log(`   📊 Current score: ${scoreResponse.data.score}%`);

    // Test 4: Get answers
    console.log('\n📝 Test 4: Getting submitted answers...');
    const answersResponse = await axios.get(`${BASE_URL}/quiz-attempts/${attempt.id}/answers`);
    console.log(`   📋 Retrieved ${answersResponse.data.length} answers`);

    // Test 5: Auto-complete
    console.log('\n📝 Test 5: Auto-completing quiz...');
    const completeResponse = await axios.post(`${BASE_URL}/quiz-attempts/${attempt.id}/auto-complete`);
    console.log(`   🏁 Quiz completed with score: ${completeResponse.data.score}%`);

    console.log(`   ✅ API endpoint tests completed successfully!`);

  } catch (error: any) {
    if (error.message.includes('Server not running')) {
      console.log('⚠️ Skipping API tests - server not running');
      console.log('   To test APIs, run: npm run start:dev');
    } else {
      console.error('❌ API test error:', error.response?.data || error.message);
    }
  }
}

async function testAdvancedScenarios() {
  console.log('🎯 Testing advanced scenarios...');

  // Scenario 1: Multiple attempts by same student
  console.log('\n📝 Scenario 1: Multiple attempts by same student...');
  
  const quiz = await prisma.quiz.findFirst({
    include: { questions: { include: { question: true } } }
  });
  
  const student = await prisma.student.findFirst();

  if (!quiz || !student) {
    console.log('⚠️ Skipping advanced tests - insufficient data');
    return;
  }

  // Create multiple attempts
  const attempts = [];
  for (let i = 0; i < 3; i++) {
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        studentId: student.id,
        status: 'COMPLETED',
        score: Math.random() * 100,
        totalQuestions: quiz.questions.length,
        correctAnswers: Math.floor(Math.random() * quiz.questions.length),
        completedAt: new Date()
      }
    });
    attempts.push(attempt);
  }

  console.log(`   ✅ Created ${attempts.length} attempts for analysis`);

  // Scenario 2: Performance analysis
  console.log('\n📝 Scenario 2: Performance analysis...');
  
  const stats = await prisma.quizAttempt.aggregate({
    where: { 
      quizId: quiz.id,
      status: 'COMPLETED'
    },
    _avg: { score: true, timeSpent: true },
    _count: { id: true },
    _max: { score: true },
    _min: { score: true }
  });

  console.log(`   📊 Quiz Performance Stats:`);
  console.log(`   - Total Attempts: ${stats._count.id}`);
  console.log(`   - Average Score: ${stats._avg.score?.toFixed(1)}%`);
  console.log(`   - Average Time: ${stats._avg.timeSpent?.toFixed(0)} seconds`);
  console.log(`   - Best Score: ${stats._max.score}%`);
  console.log(`   - Worst Score: ${stats._min.score}%`);

  // Scenario 3: Answer pattern analysis
  console.log('\n📝 Scenario 3: Answer pattern analysis...');
  
  const answerStats = await prisma.quizAnswer.groupBy({
    by: ['isCorrect'],
    _count: { isCorrect: true },
    where: {
      quizAttempt: {
        quizId: quiz.id
      }
    }
  });

  const correctCount = answerStats.find(stat => stat.isCorrect === true)?._count.isCorrect || 0;
  const wrongCount = answerStats.find(stat => stat.isCorrect === false)?._count.isCorrect || 0;
  const totalAnswers = correctCount + wrongCount;

  console.log(`   📊 Answer Pattern Analysis:`);
  console.log(`   - Total Answers: ${totalAnswers}`);
  console.log(`   - Correct Answers: ${correctCount} (${((correctCount / totalAnswers) * 100).toFixed(1)}%)`);
  console.log(`   - Wrong Answers: ${wrongCount} (${((wrongCount / totalAnswers) * 100).toFixed(1)}%)`);

  console.log(`   ✅ Advanced scenarios completed successfully!`);
}

// Run the comprehensive test
if (require.main === module) {
  comprehensiveQuizTest()
    .catch((error) => {
      console.error('❌ Comprehensive test failed:', error);
      process.exit(1);
    });
}

export { comprehensiveQuizTest };