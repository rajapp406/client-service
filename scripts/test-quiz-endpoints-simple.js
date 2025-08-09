const axios = require('axios');

const BASE_URL = 'http://localhost:3100';

async function testQuizEndpoints() {
  console.log('🌐 Testing Quiz Answer API Endpoints\n');
  console.log('Make sure the server is running: npm run start:dev\n');

  try {
    // Test server health
    console.log('🏥 Checking server health...');
    await axios.get(`${BASE_URL}/health`);
    console.log('   ✅ Server is running\n');

    // Get existing data
    console.log('📊 Getting existing data...');
    const [quizzesRes, studentsRes] = await Promise.all([
      axios.get(`${BASE_URL}/quizzes`),
      axios.get(`${BASE_URL}/students`)
    ]);

    const quizzes = quizzesRes.data;
    const students = studentsRes.data;

    console.log(`   ✅ Found ${quizzes.length} quizzes and ${students.length} students`);

    if (quizzes.length === 0 || students.length === 0) {
      console.log('❌ Need at least 1 quiz and 1 student. Run the database test first.');
      return;
    }

    const quiz = quizzes[0];
    const student = students[0];

    console.log(`   🎯 Using Quiz: "${quiz.title}"`);
    console.log(`   👤 Using Student: ${student.userId}\n`);

    // Test 1: Create Quiz Attempt
    console.log('🚀 Test 1: Creating Quiz Attempt...');
    const attemptRes = await axios.post(`${BASE_URL}/quiz-attempts`, {
      quizId: quiz.id,
      studentId: student.id
    });

    const attempt = attemptRes.data;
    console.log(`   ✅ Created attempt: ${attempt.id}`);
    console.log(`   📊 Status: ${attempt.status}\n`);

    // Test 2: Get Quiz with Questions
    console.log('📝 Test 2: Getting Quiz Questions...');
    const quizRes = await axios.get(`${BASE_URL}/quizzes/${quiz.id}?includeQuestions=true`);
    const quizWithQuestions = quizRes.data;
    
    console.log(`   ✅ Quiz has ${quizWithQuestions.questions?.length || 0} questions\n`);

    if (!quizWithQuestions.questions || quizWithQuestions.questions.length === 0) {
      console.log('❌ No questions found in quiz');
      return;
    }

    // Test 3: Submit Single Answer
    console.log('✍️ Test 3: Submitting Single Answer...');
    const firstQuestion = quizWithQuestions.questions[0].question;
    const options = JSON.parse(firstQuestion.options);
    const correctOption = options.find(opt => opt.isCorrect);

    const answerRes = await axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
      quizAttemptId: attempt.id,
      questionId: firstQuestion.id,
      selectedOption: correctOption.text,
      timeSpent: 30
    });

    const answer = answerRes.data;
    console.log(`   ✅ Answer submitted: ${answer.id}`);
    console.log(`   🎯 Result: ${answer.isCorrect ? 'Correct ✅' : 'Wrong ❌'} (${answer.pointsEarned} points)\n`);

    // Test 4: Submit Bulk Answers
    console.log('📦 Test 4: Submitting Bulk Answers...');
    const remainingQuestions = quizWithQuestions.questions.slice(1);
    
    if (remainingQuestions.length > 0) {
      const bulkAnswers = remainingQuestions.map(q => {
        const qOptions = JSON.parse(q.question.options);
        const correctOpt = qOptions.find(opt => opt.isCorrect);
        
        return {
          questionId: q.question.id,
          selectedOption: correctOpt.text,
          timeSpent: Math.floor(Math.random() * 60) + 10
        };
      });

      const bulkRes = await axios.post(`${BASE_URL}/quiz-attempts/${attempt.id}/submit-answers`, {
        answers: bulkAnswers
      });

      console.log(`   ✅ Bulk submitted ${bulkAnswers.length} answers`);
      console.log(`   📊 Processed: ${bulkRes.data.length} answers\n`);
    }

    // Test 5: Get Current Score
    console.log('🧮 Test 5: Getting Current Score...');
    const scoreRes = await axios.get(`${BASE_URL}/quiz-attempts/${attempt.id}/score`);
    const score = scoreRes.data;

    console.log(`   📊 Current Score:`);
    console.log(`   - Questions: ${score.totalQuestions}`);
    console.log(`   - Correct: ${score.correctAnswers}`);
    console.log(`   - Score: ${score.score}%`);
    console.log(`   - Points: ${score.totalPoints}/${score.maxPoints}\n`);

    // Test 6: Get All Answers
    console.log('📋 Test 6: Getting All Answers...');
    const answersRes = await axios.get(`${BASE_URL}/quiz-attempts/${attempt.id}/answers`);
    const answers = answersRes.data;

    console.log(`   ✅ Retrieved ${answers.length} answers:`);
    answers.forEach((ans, i) => {
      console.log(`   ${i + 1}. ${ans.question.questionText.substring(0, 40)}...`);
      console.log(`      Answer: ${ans.selectedOption || ans.textAnswer}`);
      console.log(`      Result: ${ans.isCorrect ? '✅ Correct' : '❌ Wrong'} (${ans.pointsEarned} points)`);
    });
    console.log('');

    // Test 7: Auto-Complete Quiz
    console.log('🏁 Test 7: Auto-Completing Quiz...');
    const completeRes = await axios.post(`${BASE_URL}/quiz-attempts/${attempt.id}/auto-complete`);
    const completed = completeRes.data;

    console.log(`   ✅ Quiz completed!`);
    console.log(`   📊 Final Results:`);
    console.log(`   - Status: ${completed.status}`);
    console.log(`   - Final Score: ${completed.score}%`);
    console.log(`   - Time Spent: ${completed.timeSpent} seconds`);
    console.log(`   - Correct: ${completed.correctAnswers}/${completed.totalQuestions}\n`);

    // Test 8: Get Quiz Statistics
    console.log('📈 Test 8: Getting Quiz Statistics...');
    const statsRes = await axios.get(`${BASE_URL}/quiz-attempts/statistics?quizId=${quiz.id}`);
    const stats = statsRes.data;

    console.log(`   📊 Quiz Statistics:`);
    console.log(`   - Total Attempts: ${stats.totalAttempts}`);
    console.log(`   - Completed: ${stats.completedAttempts}`);
    console.log(`   - Completion Rate: ${stats.completionRate.toFixed(1)}%`);
    console.log(`   - Average Score: ${stats.averageScore.toFixed(1)}%`);
    console.log(`   - Average Time: ${stats.averageTimeSpent.toFixed(0)} seconds\n`);

    // Test 9: Get Final Attempt Details
    console.log('🔍 Test 9: Getting Final Attempt Details...');
    const finalRes = await axios.get(`${BASE_URL}/quiz-attempts/${attempt.id}?includeRelations=true`);
    const final = finalRes.data;

    console.log(`   📋 Final Attempt Summary:`);
    console.log(`   - ID: ${final.id}`);
    console.log(`   - Quiz: ${final.quiz?.title || 'N/A'}`);
    console.log(`   - Student: ${final.student?.userId || 'N/A'}`);
    console.log(`   - Status: ${final.status}`);
    console.log(`   - Score: ${final.score}%`);
    console.log(`   - Started: ${new Date(final.startedAt).toLocaleString()}`);
    console.log(`   - Completed: ${new Date(final.completedAt).toLocaleString()}\n`);

    console.log('🎉 ALL API TESTS COMPLETED SUCCESSFULLY!\n');
    
    console.log('📋 Tested Endpoints:');
    console.log('   ✅ POST /quiz-attempts - Create quiz attempt');
    console.log('   ✅ POST /quiz-attempts/submit-answer - Submit single answer');
    console.log('   ✅ POST /quiz-attempts/:id/submit-answers - Submit bulk answers');
    console.log('   ✅ GET /quiz-attempts/:id/score - Get current score');
    console.log('   ✅ GET /quiz-attempts/:id/answers - Get all answers');
    console.log('   ✅ POST /quiz-attempts/:id/auto-complete - Auto-complete quiz');
    console.log('   ✅ GET /quiz-attempts/:id - Get attempt details');
    console.log('   ✅ GET /quiz-attempts/statistics - Get statistics');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running!');
      console.log('   Please start the server with: npm run start:dev');
    } else {
      console.error('❌ Test Error:', error.response?.data || error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   URL:', error.config?.url);
      }
    }
  }
}

// Run the test
testQuizEndpoints();