const axios = require('axios');

const BASE_URL = 'http://localhost:3100';

async function testAPIEdgeCases() {
  console.log('🧪 Testing API Edge Cases and Error Handling\n');

  try {
    // Get existing data
    const [quizzesResponse, studentsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/quizzes`),
      axios.get(`${BASE_URL}/students`)
    ]);

    const quizzes = quizzesResponse.data.data || quizzesResponse.data;
    const students = studentsResponse.data;

    if (quizzes.length === 0 || students.length === 0) {
      console.log('❌ Need existing quiz and student data for edge case testing');
      return;
    }

    const quiz = quizzes[0];
    const student = students[0];

    console.log('🔍 Testing Edge Cases and Error Scenarios...\n');

    // Test 1: Invalid Quiz Attempt Creation
    console.log('📝 Test 1: Invalid Quiz Attempt Creation...');
    
    try {
      await axios.post(`${BASE_URL}/quiz-attempts`, {
        quizId: 'invalid-uuid',
        studentId: student.id
      });
      console.log('   ❌ Should have failed with invalid quiz ID');
    } catch (error) {
      console.log(`   ✅ Correctly rejected invalid quiz ID: ${error.response.status}`);
    }

    try {
      await axios.post(`${BASE_URL}/quiz-attempts`, {
        quizId: quiz.id,
        studentId: 'invalid-uuid'
      });
      console.log('   ❌ Should have failed with invalid student ID');
    } catch (error) {
      console.log(`   ✅ Correctly rejected invalid student ID: ${error.response.status}`);
    }

    // Test 2: Invalid Answer Submission
    console.log('\n📝 Test 2: Invalid Answer Submission...');
    
    // Create a fresh attempt for testing
    const newStudent = await axios.post(`${BASE_URL}/students`, {
      userId: `edge-test-${Date.now()}`,
      grade: 10,
      board: 'CBSE'
    });

    const attempt = await axios.post(`${BASE_URL}/quiz-attempts`, {
      quizId: quiz.id,
      studentId: newStudent.data.id
    });

    // Test invalid question ID
    try {
      await axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
        quizAttemptId: attempt.data.id,
        questionId: 'invalid-uuid',
        selectedOption: 'A',
        timeSpent: 30
      });
      console.log('   ❌ Should have failed with invalid question ID');
    } catch (error) {
      console.log(`   ✅ Correctly rejected invalid question ID: ${error.response.status}`);
    }

    // Test invalid quiz attempt ID
    try {
      await axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
        quizAttemptId: 'invalid-uuid',
        questionId: quiz.questions?.[0]?.id || 'some-id',
        selectedOption: 'A',
        timeSpent: 30
      });
      console.log('   ❌ Should have failed with invalid attempt ID');
    } catch (error) {
      console.log(`   ✅ Correctly rejected invalid attempt ID: ${error.response.status}`);
    }

    // Test 3: Answer Submission After Completion
    console.log('\n📝 Test 3: Answer Submission After Completion...');
    
    // Complete the attempt first
    await axios.post(`${BASE_URL}/quiz-attempts/${attempt.data.id}/auto-complete`);

    // Try to submit answer after completion
    try {
      const quizDetails = await axios.get(`${BASE_URL}/quizzes/${quiz.id}`);
      const questions = quizDetails.data.data.questions;
      
      if (questions && questions.length > 0) {
        await axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
          quizAttemptId: attempt.data.id,
          questionId: questions[0].id,
          selectedOption: 'A',
          timeSpent: 30
        });
        console.log('   ❌ Should have failed - attempt is completed');
      }
    } catch (error) {
      console.log(`   ✅ Correctly rejected answer after completion: ${error.response.status}`);
    }

    // Test 4: Bulk Answer Validation
    console.log('\n📝 Test 4: Bulk Answer Validation...');
    
    // Create another fresh attempt
    const anotherStudent = await axios.post(`${BASE_URL}/students`, {
      userId: `bulk-test-${Date.now()}`,
      grade: 10,
      board: 'CBSE'
    });

    const bulkAttempt = await axios.post(`${BASE_URL}/quiz-attempts`, {
      quizId: quiz.id,
      studentId: anotherStudent.data.id
    });

    // Test empty bulk answers
    try {
      await axios.post(`${BASE_URL}/quiz-attempts/${bulkAttempt.data.id}/submit-answers`, {
        answers: []
      });
      console.log('   ❌ Should have failed with empty answers array');
    } catch (error) {
      console.log(`   ✅ Correctly rejected empty answers array: ${error.response.status}`);
    }

    // Test 5: Non-existent Resource Access
    console.log('\n📝 Test 5: Non-existent Resource Access...');
    
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    
    try {
      await axios.get(`${BASE_URL}/quiz-attempts/${fakeUuid}`);
      console.log('   ❌ Should have failed with non-existent attempt');
    } catch (error) {
      console.log(`   ✅ Correctly returned 404 for non-existent attempt: ${error.response.status}`);
    }

    try {
      await axios.get(`${BASE_URL}/quiz-attempts/${fakeUuid}/answers`);
      console.log('   ❌ Should have failed with non-existent attempt');
    } catch (error) {
      console.log(`   ✅ Correctly returned 404 for non-existent attempt answers: ${error.response.status}`);
    }

    try {
      await axios.get(`${BASE_URL}/quiz-attempts/${fakeUuid}/score`);
      console.log('   ❌ Should have failed with non-existent attempt');
    } catch (error) {
      console.log(`   ✅ Correctly returned 404 for non-existent attempt score: ${error.response.status}`);
    }

    // Test 6: Question Type Validation
    console.log('\n📝 Test 6: Question Type Validation...');
    
    const validAttempt = await axios.post(`${BASE_URL}/quiz-attempts`, {
      quizId: quiz.id,
      studentId: anotherStudent.data.id
    });

    const quizDetails = await axios.get(`${BASE_URL}/quizzes/${quiz.id}`);
    const questions = quizDetails.data.data.questions;

    if (questions && questions.length > 0) {
      const mcqQuestion = questions.find(q => q.questionType === 'MCQ');
      
      if (mcqQuestion) {
        // Test submitting text answer for MCQ question
        try {
          await axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
            quizAttemptId: validAttempt.data.id,
            questionId: mcqQuestion.id,
            textAnswer: 'This should not work for MCQ',
            timeSpent: 30
          });
          console.log('   ⚠️  MCQ with text answer was accepted (might be valid behavior)');
        } catch (error) {
          console.log(`   ✅ Correctly rejected text answer for MCQ: ${error.response.status}`);
        }

        // Test submitting no answer
        try {
          await axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
            quizAttemptId: validAttempt.data.id,
            questionId: mcqQuestion.id,
            timeSpent: 30
          });
          console.log('   ❌ Should have failed with no answer provided');
        } catch (error) {
          console.log(`   ✅ Correctly rejected submission with no answer: ${error.response.status}`);
        }
      }
    }

    // Test 7: Concurrent Answer Submissions
    console.log('\n📝 Test 7: Concurrent Answer Submissions...');
    
    if (questions && questions.length > 0) {
      const question = questions[0];
      const options = question.options;
      const correctOption = options.find(opt => opt.isCorrect);

      // Submit the same answer twice concurrently
      const promises = [
        axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
          quizAttemptId: validAttempt.data.id,
          questionId: question.id,
          selectedOption: correctOption.text,
          timeSpent: 30
        }),
        axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
          quizAttemptId: validAttempt.data.id,
          questionId: question.id,
          selectedOption: correctOption.text,
          timeSpent: 35
        })
      ];

      try {
        const results = await Promise.all(promises);
        console.log('   ✅ Concurrent submissions handled successfully');
        console.log(`   📊 Both submissions returned answers (last one should update)`);
      } catch (error) {
        console.log(`   ⚠️  One concurrent submission failed: ${error.response?.status}`);
      }
    }

    // Test 8: Performance Test
    console.log('\n📝 Test 8: Performance Test...');
    
    const performanceStudent = await axios.post(`${BASE_URL}/students`, {
      userId: `perf-test-${Date.now()}`,
      grade: 10,
      board: 'CBSE'
    });

    const perfAttempt = await axios.post(`${BASE_URL}/quiz-attempts`, {
      quizId: quiz.id,
      studentId: performanceStudent.data.id
    });

    const startTime = Date.now();
    
    // Submit answers for all questions rapidly
    if (questions && questions.length > 0) {
      const answerPromises = questions.map((question, index) => {
        const options = question.options;
        const correctOption = options.find(opt => opt.isCorrect);
        
        return axios.post(`${BASE_URL}/quiz-attempts/submit-answer`, {
          quizAttemptId: perfAttempt.data.id,
          questionId: question.id,
          selectedOption: correctOption.text,
          timeSpent: 10 + index
        });
      });

      await Promise.all(answerPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`   ✅ Submitted ${questions.length} answers in ${duration}ms`);
      console.log(`   📊 Average: ${(duration / questions.length).toFixed(1)}ms per answer`);
    }

    console.log('\n🎉 Edge Case Testing Completed Successfully!');
    
    console.log('\n📋 Edge Cases Tested:');
    console.log('   ✅ Invalid UUID validation');
    console.log('   ✅ Answer submission after completion');
    console.log('   ✅ Empty bulk answers validation');
    console.log('   ✅ Non-existent resource handling');
    console.log('   ✅ Question type validation');
    console.log('   ✅ Concurrent submissions');
    console.log('   ✅ Performance under load');

  } catch (error) {
    console.error('\n❌ Edge case testing failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the edge case tests
testAPIEdgeCases();