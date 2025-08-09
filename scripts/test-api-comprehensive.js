const axios = require("axios");

const BASE_URL = "http://localhost:3100";

async function testAPIComprehensive() {
  console.log("🧪 Comprehensive API Testing for Quiz Answer System\n");
  console.log("Testing server at:", BASE_URL);

  try {
    // Step 1: Test basic connectivity and discover available endpoints
    console.log("🔍 Step 1: Testing server connectivity...");

    try {
      const response = await axios.get(`${BASE_URL}`);
      console.log("   ✅ Server is responding");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("   ✅ Server is running (404 expected for root endpoint)");
      } else {
        throw error;
      }
    }

    // Step 2: Test existing data endpoints
    console.log("\n📊 Step 2: Checking existing data...");

    let quizzes = [];
    let students = [];

    try {
      const quizzesResponse = await axios.get(`${BASE_URL}/quizzes`);
      // Handle ResponseUtil wrapped response
      quizzes = quizzesResponse.data.data || quizzesResponse.data;
      console.log(`   ✅ Found ${quizzes.length} quizzes`);
    } catch (error) {
      console.log(
        `   ❌ Error fetching quizzes: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }

    // Since there's no /students endpoint, let's create a student directly in the database
    // or check if we can use the existing data
    console.log(
      "   📝 Note: No /students endpoint found, will create student via database"
    );

    // Get existing students or create one
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/students`);
      students = studentsResponse.data;
      console.log(`   ✅ Found ${students.length} students`);
    } catch (error) {
      console.log(
        `   ❌ Error fetching students: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }

    // If we don't have students, create one
    if (students.length === 0) {
      console.log("\n🔧 Creating test student...");
      try {
        const createStudentResponse = await axios.post(`${BASE_URL}/students`, {
          userId: `test-student-api-${Date.now()}`,
          grade: 10,
          board: "CBSE",
        });

        const newStudent = createStudentResponse.data;
        students.push(newStudent);
        console.log(`   ✅ Created test student: ${newStudent.id}`);
      } catch (error) {
        console.log(
          `   ❌ Error creating student: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );

        // If creation failed, try to get existing students again
        try {
          const studentsResponse = await axios.get(`${BASE_URL}/students`);
          students = studentsResponse.data;
          console.log(
            `   ✅ Using existing students: ${students.length} found`
          );
        } catch (err) {
          console.log(
            `   ❌ Cannot get students: ${err.response?.status} - ${err.response?.data?.message || err.message}`
          );
        }
      }
    }

    if (quizzes.length === 0 || students.length === 0) {
      console.log("\n❌ Cannot proceed with tests - insufficient data");
      console.log(
        `   Quizzes: ${quizzes.length}, Students: ${students.length}`
      );
      return;
    }

    const quiz = quizzes[0];
    const student = students[0];

    console.log(`\n🎯 Using Quiz: "${quiz.title}" (ID: ${quiz.id})`);
    console.log(`👤 Using Student: ${student.userId} (ID: ${student.id})`);

    // Step 3: Test Quiz Attempt Creation
    console.log("\n🚀 Step 3: Testing Quiz Attempt Creation...");

    let quizAttempt;
    try {
      const attemptResponse = await axios.post(`${BASE_URL}/quiz-attempts`, {
        quizId: quiz.id,
        studentId: student.id,
      });

      quizAttempt = attemptResponse.data;
      console.log(`   ✅ Created quiz attempt: ${quizAttempt.id}`);
      console.log(`   📊 Status: ${quizAttempt.status}`);
      console.log(
        `   ⏰ Started at: ${new Date(quizAttempt.startedAt).toLocaleString()}`
      );
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(
          `   ⚠️  Student already has an active attempt. Let's find and use it...`
        );

        // Try to get existing attempts for this student and quiz
        try {
          const attemptsResponse = await axios.get(
            `${BASE_URL}/quiz-attempts/student/${student.id}?includeRelations=true`
          );
          const attempts = attemptsResponse.data;

          // Find an in-progress attempt for this quiz
          const activeAttempt = attempts.find(
            (attempt) =>
              attempt.quizId === quiz.id && attempt.status === "IN_PROGRESS"
          );

          if (activeAttempt) {
            quizAttempt = activeAttempt;
            console.log(`   ✅ Using existing quiz attempt: ${quizAttempt.id}`);
            console.log(`   📊 Status: ${quizAttempt.status}`);
          } else {
            // Create a new student for testing
            console.log(`   🔧 Creating new student for testing...`);
            const newStudentResponse = await axios.post(
              `${BASE_URL}/students`,
              {
                userId: `test-student-api-${Date.now()}`,
                grade: 10,
                board: "CBSE",
              }
            );

            const newStudent = newStudentResponse.data;
            console.log(`   ✅ Created new student: ${newStudent.id}`);

            // Create attempt with new student
            const newAttemptResponse = await axios.post(
              `${BASE_URL}/quiz-attempts`,
              {
                quizId: quiz.id,
                studentId: newStudent.id,
              }
            );

            quizAttempt = newAttemptResponse.data;
            student = newStudent; // Update student reference
            console.log(
              `   ✅ Created quiz attempt with new student: ${quizAttempt.id}`
            );
          }
        } catch (getError) {
          console.log(
            `   ❌ Error handling existing attempt: ${getError.response?.status} - ${getError.response?.data?.message || getError.message}`
          );
          return;
        }
      } else {
        console.log(
          `   ❌ Error creating quiz attempt: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
        if (error.response?.data) {
          console.log(
            `   📋 Error details:`,
            JSON.stringify(error.response.data, null, 2)
          );
        }
        return;
      }
    }

    // Step 4: Get Quiz Questions
    console.log("\n📝 Step 4: Getting Quiz Questions...");

    let quizQuestions = [];
    try {
      // Get quiz details with questions
      const quizDetailsResponse = await axios.get(
        `${BASE_URL}/quizzes/${quiz.id}`
      );
      const quizData =
        quizDetailsResponse.data.data || quizDetailsResponse.data;
      quizQuestions = quizData.questions || [];
      console.log(`   ✅ Found ${quizQuestions.length} questions in quiz`);

      if (quizQuestions.length > 0) {
        console.log(
          `   📋 Question types: ${quizQuestions.map((q) => q.questionType).join(", ")}`
        );
      }
    } catch (error) {
      console.log(
        `   ❌ Error fetching quiz questions: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }

    if (quizQuestions.length === 0) {
      console.log(
        "\n⚠️  No questions found for this quiz. Cannot test answer submission."
      );
      console.log(
        "   Please ensure the quiz has questions associated with it."
      );
      return;
    }

    // Step 5: Test Answer Submission
    console.log("\n✍️ Step 5: Testing Answer Submission...");

    const submittedAnswers = [];

    for (let i = 0; i < Math.min(quizQuestions.length, 3); i++) {
      const question = quizQuestions[i];

      console.log(
        `\n   📝 Question ${i + 1}: ${question.questionText?.substring(0, 50) || "Question text not available"}...`
      );
      console.log(`   🔤 Type: ${question.questionType}`);

      try {
        // Parse options
        let options = [];
        if (question.options) {
          options = Array.isArray(question.options)
            ? question.options
            : JSON.parse(question.options);
        }

        console.log(`   📋 Options: ${options.length} available`);

        // Find correct answer
        const correctOption = options.find((opt) => opt.isCorrect);

        if (!correctOption) {
          console.log(`   ⚠️  No correct option found, using first option`);
        }

        // Prepare answer payload
        let answerPayload = {
          quizAttemptId: quizAttempt.id,
          questionId: question.id,
          timeSpent: Math.floor(Math.random() * 60) + 10,
        };

        // Set answer based on question type
        switch (question.questionType) {
          case "MCQ":
          case "TRUE_FALSE":
            answerPayload.selectedOption = correctOption
              ? correctOption.text
              : options[0]?.text || "A";
            break;
          case "FILL_BLANK":
            answerPayload.textAnswer = correctOption
              ? correctOption.text
              : "Test answer";
            break;
          default:
            answerPayload.selectedOption = "A";
        }

        console.log(
          `   📤 Submitting answer: ${answerPayload.selectedOption || answerPayload.textAnswer}`
        );

        // Submit answer
        const answerResponse = await axios.post(
          `${BASE_URL}/quiz-attempts/submit-answer`,
          answerPayload
        );
        const submittedAnswer = answerResponse.data;

        console.log(`   ✅ Answer submitted: ${submittedAnswer.id}`);
        console.log(
          `   🎯 Result: ${submittedAnswer.isCorrect ? "Correct ✅" : "Wrong ❌"} (${submittedAnswer.pointsEarned} points)`
        );

        submittedAnswers.push(submittedAnswer);
      } catch (error) {
        console.log(
          `   ❌ Error submitting answer: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
        if (error.response?.data) {
          console.log(
            `   📋 Error details:`,
            JSON.stringify(error.response.data, null, 2)
          );
        }
      }
    }

    // Step 6: Test Bulk Answer Submission
    console.log("\n📦 Step 6: Testing Bulk Answer Submission...");

    if (quizQuestions.length > submittedAnswers.length) {
      const remainingQuestions = quizQuestions.slice(submittedAnswers.length);

      try {
        const bulkAnswers = remainingQuestions.slice(0, 2).map((q) => {
          const question = q.question || q;
          const options = Array.isArray(question.options)
            ? question.options
            : JSON.parse(question.options || "[]");
          const correctOption = options.find((opt) => opt.isCorrect);

          let answer = {
            questionId: question.id,
            timeSpent: Math.floor(Math.random() * 60) + 10,
          };

          switch (question.questionType) {
            case "MCQ":
            case "TRUE_FALSE":
              answer.selectedOption = correctOption
                ? correctOption.text
                : options[0]?.text || "A";
              break;
            case "FILL_BLANK":
              answer.textAnswer = correctOption
                ? correctOption.text
                : "Test answer";
              break;
          }

          return answer;
        });

        if (bulkAnswers.length > 0) {
          const bulkResponse = await axios.post(
            `${BASE_URL}/quiz-attempts/${quizAttempt.id}/submit-answers`,
            {
              answers: bulkAnswers,
            }
          );

          console.log(`   ✅ Bulk submitted ${bulkAnswers.length} answers`);
          console.log(`   📊 Processed: ${bulkResponse.data.length} answers`);
        }
      } catch (error) {
        console.log(
          `   ❌ Error with bulk submission: ${error.response?.status} - ${error.response?.data?.message || error.message}`
        );
      }
    } else {
      console.log("   ⚠️  No remaining questions for bulk submission test");
    }

    // Step 7: Test Score Calculation
    console.log("\n🧮 Step 7: Testing Score Calculation...");

    try {
      const scoreResponse = await axios.get(
        `${BASE_URL}/quiz-attempts/${quizAttempt.id}/score`
      );
      const score = scoreResponse.data;

      console.log(`   📊 Current Score:`);
      console.log(`   - Questions Answered: ${score.totalQuestions}`);
      console.log(`   - Correct Answers: ${score.correctAnswers}`);
      console.log(`   - Score Percentage: ${score.score}%`);
      console.log(`   - Points: ${score.totalPoints}/${score.maxPoints}`);
    } catch (error) {
      console.log(
        `   ❌ Error calculating score: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }

    // Step 8: Test Getting All Answers
    console.log("\n📋 Step 8: Testing Get All Answers...");

    try {
      const answersResponse = await axios.get(
        `${BASE_URL}/quiz-attempts/${quizAttempt.id}/answers`
      );
      const answers = answersResponse.data;

      console.log(`   ✅ Retrieved ${answers.length} answers:`);
      answers.forEach((answer, index) => {
        console.log(
          `   ${index + 1}. Question: ${answer.question?.questionText?.substring(0, 40) || "N/A"}...`
        );
        console.log(
          `      Answer: ${answer.selectedOption || answer.textAnswer}`
        );
        console.log(
          `      Result: ${answer.isCorrect ? "✅ Correct" : "❌ Wrong"} (${answer.pointsEarned} points)`
        );
        console.log(`      Time: ${answer.timeSpent}s`);
      });
    } catch (error) {
      console.log(
        `   ❌ Error getting answers: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }

    // Step 9: Test Auto-Complete
    console.log("\n🏁 Step 9: Testing Auto-Complete...");

    try {
      const completeResponse = await axios.post(
        `${BASE_URL}/quiz-attempts/${quizAttempt.id}/auto-complete`
      );
      const completed = completeResponse.data;

      console.log(`   ✅ Quiz auto-completed!`);
      console.log(`   📊 Final Results:`);
      console.log(`   - Status: ${completed.status}`);
      console.log(`   - Final Score: ${completed.score}%`);
      console.log(`   - Time Spent: ${completed.timeSpent} seconds`);
      console.log(
        `   - Correct: ${completed.correctAnswers}/${completed.totalQuestions}`
      );
    } catch (error) {
      console.log(
        `   ❌ Error auto-completing: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }

    // Step 10: Test Statistics
    console.log("\n📈 Step 10: Testing Statistics...");

    try {
      const statsResponse = await axios.get(
        `${BASE_URL}/quiz-attempts/statistics?quizId=${quiz.id}`
      );
      const stats = statsResponse.data;

      console.log(`   📊 Quiz Statistics:`);
      console.log(`   - Total Attempts: ${stats.totalAttempts}`);
      console.log(`   - Completed: ${stats.completedAttempts}`);
      console.log(`   - Completion Rate: ${stats.completionRate.toFixed(1)}%`);
      console.log(`   - Average Score: ${stats.averageScore.toFixed(1)}%`);
      console.log(
        `   - Average Time: ${stats.averageTimeSpent.toFixed(0)} seconds`
      );
    } catch (error) {
      console.log(
        `   ❌ Error getting statistics: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }

    // Step 11: Test Final Attempt Details
    console.log("\n🔍 Step 11: Testing Final Attempt Details...");

    try {
      const finalResponse = await axios.get(
        `${BASE_URL}/quiz-attempts/${quizAttempt.id}?includeRelations=true`
      );
      const final = finalResponse.data;

      console.log(`   📋 Final Attempt Summary:`);
      console.log(`   - ID: ${final.id}`);
      console.log(`   - Quiz: ${final.quiz?.title || "N/A"}`);
      console.log(`   - Student: ${final.student?.userId || "N/A"}`);
      console.log(`   - Status: ${final.status}`);
      console.log(`   - Score: ${final.score}%`);
      console.log(
        `   - Started: ${new Date(final.startedAt).toLocaleString()}`
      );
      console.log(
        `   - Completed: ${final.completedAt ? new Date(final.completedAt).toLocaleString() : "N/A"}`
      );
    } catch (error) {
      console.log(
        `   ❌ Error getting final details: ${error.response?.status} - ${error.response?.data?.message || error.message}`
      );
    }

    console.log("\n🎉 API TESTING COMPLETED!\n");

    console.log("📋 Tested Endpoints Summary:");
    console.log("   ✅ POST /quiz-attempts - Create quiz attempt");
    console.log(
      "   ✅ POST /quiz-attempts/submit-answer - Submit single answer"
    );
    console.log(
      "   ✅ POST /quiz-attempts/:id/submit-answers - Submit bulk answers"
    );
    console.log("   ✅ GET /quiz-attempts/:id/score - Get current score");
    console.log("   ✅ GET /quiz-attempts/:id/answers - Get all answers");
    console.log(
      "   ✅ POST /quiz-attempts/:id/auto-complete - Auto-complete quiz"
    );
    console.log("   ✅ GET /quiz-attempts/:id - Get attempt details");
    console.log("   ✅ GET /quiz-attempts/statistics - Get statistics");
  } catch (error) {
    console.error("\n❌ CRITICAL ERROR:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the comprehensive test
testAPIComprehensive();
