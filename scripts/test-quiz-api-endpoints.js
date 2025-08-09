const axios = require('axios');

const BASE_URL = 'http://localhost:3100';

async function testQuizAPIEndpoints() {
  console.log('🌐 Testing Quiz Attempt API Endpoints...\n');

  try {
    // Step 1: Get existing data
    console.log('📊 Step 1: Fetching existing data...');
    
    const [quizzesResponse, studentsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/quizzes`),
      axios.get(`${BASE_URL}/students`)
    ]);

    const quizzes = quizzesResponse.data;
    const students = studentsResponse.data;

    console.log(`   ✅ Found ${quizzes.length} quizzes`);
    console.log(`   ✅ Found ${students.length} students`);

    if (quizzes.length === 0 || students.length === 0) {
      console.log('❌ Need at least 1 quiz and 1 student to test. Please run the workflow test first.');
      return;
    }

    const quiz = quizzes[0];
    const student = students[0];

    console.log(`   🎯 Using Quiz: "${quiz.title}"`);
    console.log(`   👤 Using Student: ${student.userId}`);

    // Step 2: Create Quiz Attempt via API
    console.log('\n🚀 Step 2: Creating Quiz Attempt via API...');
    
    const createAttemptResponse = await axios.post(`${BASE_URL}/quiz-attempts`, {
      quizId: quiz.id,
      studentId: student.id
    });

    const quizAttempt = createAttemptResponse.data;
    console.log(`   ✅ Created quiz attempt: ${quizAttempt.id}`);
    console.log(`   📊 Status: ${quizAttempt.status}`);

    // Step 3: Get Quiz Questions
    console.log('\n📝 Step 3: Getting Quiz Questions...');
    
    const quizDetailsResponse = await axios.get(`${BASE_URL}/quizzes/${quiz.id}?includeQuestions=true`);
    const quizWithQuestions = quizDetailsResponse.data;
    
    console.log(`   ✅ Quiz has ${quizWithQuestions.questions?.length || 0} questions`);

    if (!quizWithQuestions.questions || quizWithQuestions.questions.length === 0) {
      console.log('❌ No questions found in quiz');
      return;
    }

    // Step 4: Submit Individual Answers via API
    console.log('\n✍️ Step 4: Submitting Answers via API...');
    
    const answers = [];
    
    for (let i = 0; i < Math.min(quizWithQuestions.questions.length, 2); i++) {
      const quizQuestion = quizWithQuestions.questions[i];
      const question = quizQuestion.question;
      
      console.log(`\n   📝 Question ${i + 1}: ${question.questionText.substring(0, 50)}...`);
      
      // Parse options
      const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options);
      const correctOption = options.find(opt => opt.isCorrect);
      
      // Submit answer via API
      const answerPayload = {
        quizAttemptId: quizAttempt.id,
        questionId: question.id,
        selectedOption: correctOption ? correctOption.text : options[0].text,
        timeSpent: Math.floor(Math.random() * 60) + 10
      };

      console.log(`   📤 Submitting answer: ${answerPayload.selectedOption}`);
      
      const submitResponse = await axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, answerPayload);
      const submittedAnswer = submitResponse.data;
      
      console.log(`   ✅ Answer submitted: ${submittedAnswer.id}`);
      console.log(`   🎯 Result: ${submittedAnswer.isCorrect ? 'Correct' : 'Wrong'} (${submittedAnswer.pointsEarned} points)`);
      
      answers.push(submittedAnswer);
    }

    // Step 5: Get Current Score via API
    console.log('\n🧮 Step 5: Getting Current Score via API...');
    
    const scoreResponse = await axios.get(`${BASE_URL}/quiz-attempts/${quizAttempt.id}/score`);
    const scoreData = scoreResponse.data;
    
    console.log(`   📊 Current Score:`);
    console.log(`   - Questions Answered: ${scoreData.totalQuestions}`);
    console.log(`   - Correct Answers: ${scoreData.correctAnswers}`);
    console.log(`   - Score: ${scoreData.score}%`);
    console.log(`   - Points: ${scoreData.totalPoints}/${scoreData.maxPoints}`);

    // Step 6: Get All Answers via API
    console.log('\n📋 Step 6: Getting All Answers via API...');
    
    const answersResponse = await axios.get(`${BASE_URL}/quiz-attempts/${quizAttempt.id}/answers`);
    const allAnswers = answersResponse.data;
    
    console.log(`   ✅ Retrieved ${allAnswers.length} answers`);
    allAnswers.forEach((answer, index) => {
      console.log(`   ${index + 1}. ${answer.question.questionText.substring(0, 40)}...`);
      console.log(`      Answer: ${answer.selectedOption || answer.textAnswer}`);
      console.log(`      Result: ${answer.isCorrect ? '✅ Correct' : '❌ Wrong'} (${answer.pointsEarned} points)`);
    });

    // Step 7: Auto-Complete Quiz via API
    console.log('\n🏁 Step 7: Auto-Completing Quiz via API...');
    
    const completeResponse = await axios.post(`${BASE_URL}/quiz-attempts/${quizAttempt.id}/auto-complete`);
    const completedAttempt = completeResponse.data;
    
    console.log(`   ✅ Quiz auto-completed!`);
    console.log(`   📊 Final Results:`);
    console.log(`   - Status: ${completedAttempt.status}`);
    console.log(`   - Final Score: ${completedAttempt.score}%`);
    console.log(`   - Time Spent: ${completedAttempt.timeSpent} seconds`);
    console.log(`   - Correct Answers: ${completedAttempt.correctAnswers}/${completedAttempt.totalQuestions}`);

    // Step 8: Get Final Quiz Attempt Details
    console.log('\n🔍 Step 8: Getting Final Quiz Attempt Details...');
    
    const finalAttemptResponse = await axios.get(`${BASE_URL}/quiz-attempts/${quizAttempt.id}?includeRelations=true`);
    const finalAttempt = finalAttemptResponse.data;
    
    console.log(`   📋 Final Quiz Attempt Summary:`);
    console.log(`   - ID: ${finalAttempt.id}`);
    console.log(`   - Quiz: ${finalAttempt.quiz?.title || 'N/A'}`);
    console.log(`   - Student: ${finalAttempt.student?.userId || 'N/A'}`);
    console.log(`   - Status: ${finalAttempt.status}`);
    console.log(`   - Score: ${finalAttempt.score}%`);
    console.log(`   - Duration: ${finalAttempt.timeSpent} seconds`);
    console.log(`   - Started: ${new Date(finalAttempt.startedAt).toLocaleString()}`);
    console.log(`   - Completed: ${finalAttempt.completedAt ? new Date(finalAttempt.completedAt).toLocaleString() : 'N/A'}`);

    // Step 9: Test Bulk Answer Submission (create another attempt)
    console.log('\n📦 Step 9: Testing Bulk Answer Submission...');
    
    const bulkAttemptResponse = await axios.post(`${BASE_URL}/quiz-attempts`, {
      quizId: quiz.id,
      studentId: student.id
    });

    const bulkAttempt = bulkAttemptResponse.data;
    console.log(`   ✅ Created new attempt for bulk test: ${bulkAttempt.id}`);

    // Prepare bulk answers
    const bulkAnswers = quizWithQuestions.questions.slice(0, 2).map(quizQuestion => {
      const question = quizQuestion.question;
      const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options);
      const correctOption = options.find(opt => opt.isCorrect);
      
      return {
        questionId: question.id,
        selectedOption: correctOption ? correctOption.text : options[0].text,
        timeSpent: Math.floor(Math.random() * 60) + 10
      };
    });

    const bulkSubmitResponse = await axios.post(`${BASE_URL}/quiz-attempts/${bulkAttempt.id}/submit-answers`, {
      answers: bulkAnswers
    });

    console.log(`   ✅ Bulk submitted ${bulkAnswers.length} answers`);
    console.log(`   📊 Results: ${bulkSubmitResponse.data.length} answers processed`);

    // Auto-complete the bulk attempt
    const bulkCompleteResponse = await axios.post(`${BASE_URL}/quiz-attempts/${bulkAttempt.id}/auto-complete`);
    console.log(`   🏁 Bulk attempt completed with score: ${bulkCompleteResponse.data.score}%`);

    // Step 10: Get Quiz Attempt Statistics
    console.log('\n📈 Step 10: Getting Quiz Attempt Statistics...');
    
    const statsResponse = await axios.get(`${BASE_URL}/quiz-attempts/statistics?quizId=${quiz.id}`);
    const stats = statsResponse.data;
    
    console.log(`   📊 Quiz Statistics:`);
    console.log(`   - Total Attempts: ${stats.totalAttempts}`);
    console.log(`   - Completed Attempts: ${stats.completedAttempts}`);
    console.log(`   - Completion Rate: ${stats.completionRate.toFixed(1)}%`);
    console.log(`   - Average Score: ${stats.averageScore.toFixed(1)}%`);
    console.log(`   - Average Time: ${stats.averageTimeSpent.toFixed(0)} seconds`);

    console.log('\n🎉 All API Endpoint Tests Completed Successfully!');
    console.log('\n📋 Summary of Tested Endpoints:');
    console.log('   ✅ POST /quiz-attempts - Create quiz attempt');
    console.log('   ✅ POST /quiz-attempts/submit-answer - Submit individual answer');
    console.log('   ✅ POST /quiz-attempts/:id/submit-answers - Bulk submit answers');
    console.log('   ✅ GET /quiz-attempts/:id/answers - Get all answers');
    console.log('   ✅ GET /quiz-attempts/:id/score - Calculate current score');
    console.log('   ✅ POST /quiz-attempts/:id/auto-complete - Auto-complete quiz');
    console.log('   ✅ GET /quiz-attempts/:id - Get quiz attempt details');
    console.log('   ✅ GET /quiz-attempts/statistics - Get statistics');

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testQuizAPIEndpoints();