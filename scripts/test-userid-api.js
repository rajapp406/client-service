const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function testUserIdAPI() {
  console.log('🧪 Testing userId API Changes\n');

  try {
    // Test 1: Create a new quiz attempt with userId
    console.log('📝 Test 1: Creating quiz attempt with userId...');
    
    // Get a quiz and user for testing
    const quiz = await prisma.quiz.findFirst();
    const userProfile = await prisma.userProfile.findFirst();
    
    if (!quiz || !userProfile) {
      console.log('❌ No quiz or user profile found for testing');
      return;
    }

    console.log(`   Using Quiz: "${quiz.title}"`);
    console.log(`   Using User ID: ${userProfile.userId}`);

    // Create quiz attempt using the service logic
    const newAttempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: userProfile.userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      }
    });

    console.log(`   ✅ Created quiz attempt: ${newAttempt.id}`);

    // Test 2: Query attempts by userId
    console.log('\n📊 Test 2: Querying attempts by userId...');
    
    const userAttempts = await prisma.quizAttempt.findMany({
      where: { userId: userProfile.userId },
      include: {
        quiz: {
          select: {
            title: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    console.log(`   ✅ Found ${userAttempts.length} attempts for user ${userProfile.userId}`);
    userAttempts.forEach((attempt, index) => {
      console.log(`      ${index + 1}. Quiz: "${attempt.quiz.title}" - Status: ${attempt.status}`);
    });

    // Test 3: Update attempt
    console.log('\n🔄 Test 3: Updating quiz attempt...');
    
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: newAttempt.id },
      data: {
        score: 75.5,
        totalQuestions: 10,
        correctAnswers: 8,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    console.log(`   ✅ Updated attempt score: ${updatedAttempt.score}%`);

    // Test 4: Get statistics
    console.log('\n📈 Test 4: Getting user statistics...');
    
    const stats = await prisma.quizAttempt.aggregate({
      where: { 
        userId: userProfile.userId,
        status: 'COMPLETED'
      },
      _count: { id: true },
      _avg: { score: true },
    });

    console.log(`   ✅ User has ${stats._count.id} completed attempts`);
    console.log(`   ✅ Average score: ${stats._avg.score?.toFixed(1)}%`);

    // Test 5: Clean up test data
    console.log('\n🧹 Test 5: Cleaning up test data...');
    
    await prisma.quizAttempt.delete({
      where: { id: newAttempt.id }
    });

    console.log(`   ✅ Deleted test attempt: ${newAttempt.id}`);

    console.log('\n🎉 All userId API tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testUserIdAPI()
    .catch((error) => {
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testUserIdAPI };