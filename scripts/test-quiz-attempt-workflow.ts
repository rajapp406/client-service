import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function testQuizAttemptWorkflow() {
  console.log("🧪 Starting Quiz Attempt Workflow Test...\n");

  try {
    // Step 1: Check existing data
    console.log("📊 Checking existing data...");

    const [quizzes, students, questions] = await Promise.all([
      prisma.quiz.findMany({
        include: {
          questions: {
            include: {
              question: true,
            },
          },
        },
      }),
      prisma.student.findMany(),
      prisma.quizQuestion.findMany({
        take: 5,
      }),
    ]);

    console.log(`   - Found ${quizzes.length} quizzes`);
    console.log(`   - Found ${students.length} students`);
    console.log(`   - Found ${questions.length} questions`);

    if (quizzes.length === 0) {
      console.log("❌ No quizzes found. Please create a quiz first.");
      return;
    }

    if (students.length === 0) {
      console.log("❌ No students found. Creating a test student...");

      // Create a test student
      const testStudent = await prisma.student.create({
        data: {
          userId: "test-user-123",
          grade: 10,
          board: "CBSE",
        },
      });

      console.log(`✅ Created test student: ${testStudent.id}`);
      students.push(testStudent);
    }

    const quiz = quizzes[0];
    const student = students[0];

    console.log(
      `\n🎯 Using Quiz: "${quiz.title}" (${quiz.questions.length} questions)`
    );
    console.log(`👤 Using Student: ${student.userId} (Grade ${student.grade})`);

    // Step 2: Create Quiz Attempt
    console.log("\n🚀 Step 1: Creating Quiz Attempt...");

    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        studentId: student.id,
        status: "IN_PROGRESS",
      },
    });

    console.log(`✅ Created quiz attempt: ${quizAttempt.id}`);
    console.log(`   - Status: ${quizAttempt.status}`);
    console.log(`   - Started at: ${quizAttempt.startedAt}`);

    // Step 3: Get Quiz Questions
    console.log("\n📝 Step 2: Fetching Quiz Questions...");

    const quizQuestions = await prisma.quizToQuestion.findMany({
      where: { quizId: quiz.id },
      include: {
        question: true,
      },
      orderBy: { order: "asc" },
    });

    console.log(`✅ Found ${quizQuestions.length} questions for this quiz`);

    // Step 4: Submit Answers
    console.log("\n✍️ Step 3: Submitting Answers...");

    const answers = [];

    for (let i = 0; i < Math.min(quizQuestions.length, 3); i++) {
      const quizQuestion = quizQuestions[i];
      const question = quizQuestion.question;

      console.log(
        `\n   Question ${i + 1}: ${question.questionText.substring(0, 50)}...`
      );
      console.log(`   Type: ${question.questionType}`);

      let answerData: any = {
        quizAttemptId: quizAttempt.id,
        questionId: question.id,
        timeSpent: Math.floor(Math.random() * 60) + 10, // Random time 10-70 seconds
        answeredAt: new Date(),
      };

      // Parse options to understand the question structure
      const options = Array.isArray(question.options)
        ? question.options
        : JSON.parse(question.options as string);
      console.log(`   Options: ${JSON.stringify(options, null, 2)}`);

      // Simulate different answer scenarios
      let isCorrect = false;
      let pointsEarned = 0;

      switch (question.questionType) {
        case "MCQ":
        case "TRUE_FALSE":
          // Find correct answer
          const correctOption = options.find((opt: any) => opt.isCorrect);

          // Simulate 70% chance of correct answer
          if (Math.random() < 0.7 && correctOption) {
            answerData.selectedOption = correctOption.text;
            isCorrect = true;
            pointsEarned = quizQuestion.points;
            console.log(
              `   ✅ Submitting CORRECT answer: ${correctOption.text}`
            );
          } else {
            // Pick a random wrong answer
            const wrongOptions = options.filter((opt: any) => !opt.isCorrect);
            if (wrongOptions.length > 0) {
              answerData.selectedOption = wrongOptions[0].text;
              console.log(
                `   ❌ Submitting WRONG answer: ${wrongOptions[0].text}`
              );
            }
          }
          break;

        case "FILL_BLANK":
          const correctAnswers = options.filter((opt: any) => opt.isCorrect);

          // Simulate 60% chance of correct answer
          if (Math.random() < 0.6 && correctAnswers.length > 0) {
            answerData.textAnswer = correctAnswers[0].text;
            isCorrect = true;
            pointsEarned = quizQuestion.points;
            console.log(
              `   ✅ Submitting CORRECT answer: ${correctAnswers[0].text}`
            );
          } else {
            answerData.textAnswer = "Wrong answer";
            console.log(`   ❌ Submitting WRONG answer: Wrong answer`);
          }
          break;
      }

      // Set calculated values
      answerData.isCorrect = isCorrect;
      answerData.pointsEarned = pointsEarned;

      // Create the answer
      const answer = await prisma.quizAnswer.create({
        data: answerData,
      });

      answers.push(answer);
      console.log(
        `   💾 Saved answer: ${answer.id} (${isCorrect ? "Correct" : "Wrong"}, ${pointsEarned} points)`
      );
    }

    // Step 5: Calculate Score
    console.log("\n🧮 Step 4: Calculating Final Score...");

    const allAnswers = await prisma.quizAnswer.findMany({
      where: { quizAttemptId: quizAttempt.id },
    });

    const totalQuestions = allAnswers.length;
    const correctAnswers = allAnswers.filter(
      (answer) => answer.isCorrect
    ).length;
    const totalPoints = allAnswers.reduce(
      (sum, answer) => sum + answer.pointsEarned,
      0
    );
    const maxPoints = quizQuestions
      .slice(0, totalQuestions)
      .reduce((sum, qq) => sum + qq.points, 0);
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    console.log(`   📊 Quiz Results:`);
    console.log(`   - Total Questions: ${totalQuestions}`);
    console.log(`   - Correct Answers: ${correctAnswers}`);
    console.log(`   - Total Points: ${totalPoints}/${maxPoints}`);
    console.log(`   - Score: ${score.toFixed(1)}%`);

    // Step 6: Complete Quiz Attempt
    console.log("\n🏁 Step 5: Completing Quiz Attempt...");

    const timeSpent = Math.floor(
      (new Date().getTime() - quizAttempt.startedAt.getTime()) / 1000
    );

    const completedAttempt = await prisma.quizAttempt.update({
      where: { id: quizAttempt.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        timeSpent: timeSpent,
        score: Math.round(score * 100) / 100,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        totalPoints: totalPoints,
        maxPoints: maxPoints,
      },
    });

    console.log(`✅ Quiz attempt completed!`);
    console.log(`   - Final Status: ${completedAttempt.status}`);
    console.log(`   - Time Spent: ${timeSpent} seconds`);
    console.log(`   - Final Score: ${completedAttempt.score}%`);

    // Step 7: Verify Results
    console.log("\n🔍 Step 6: Verifying Results...");

    const finalAttempt = await prisma.quizAttempt.findUnique({
      where: { id: quizAttempt.id },
      include: {
        answers: {
          include: {
            question: {
              select: {
                questionText: true,
                questionType: true,
              },
            },
          },
        },
        quiz: {
          select: {
            title: true,
          },
        },
        student: {
          select: {
            userId: true,
            grade: true,
          },
        },
      },
    });

    console.log(`\n📋 Final Quiz Attempt Summary:`);
    console.log(`   Quiz: ${finalAttempt?.quiz.title}`);
    console.log(
      `   Student: ${finalAttempt?.student.userId} (Grade ${finalAttempt?.student.grade})`
    );
    console.log(`   Status: ${finalAttempt?.status}`);
    console.log(
      `   Score: ${finalAttempt?.score}% (${finalAttempt?.correctAnswers}/${finalAttempt?.totalQuestions})`
    );
    console.log(
      `   Points: ${finalAttempt?.totalPoints}/${finalAttempt?.maxPoints}`
    );
    console.log(`   Duration: ${finalAttempt?.timeSpent} seconds`);

    console.log(`\n📝 Answer Details:`);
    finalAttempt?.answers.forEach((answer, index) => {
      const question = answer.question;
      console.log(
        `   ${index + 1}. ${question.questionText.substring(0, 40)}...`
      );
      console.log(`      Type: ${question.questionType}`);
      console.log(
        `      Answer: ${answer.selectedOption || answer.textAnswer}`
      );
      console.log(
        `      Result: ${answer.isCorrect ? "✅ Correct" : "❌ Wrong"} (${answer.pointsEarned} points)`
      );
      console.log(`      Time: ${answer.timeSpent}s`);
      console.log("");
    });

    console.log("\n🎉 Quiz Attempt Workflow Test Completed Successfully!");
  } catch (error) {
    console.error("❌ Error during quiz attempt workflow test:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testQuizAttemptWorkflow().catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
}

export { testQuizAttemptWorkflow };
