const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function checkQuizAttempts() {
  console.log('🔍 Checking existing quiz attempts...\n');

  try {
    // Check quiz attempts count
    const attemptCount = await prisma.quizAttempt.count();
    console.log(`📊 Total quiz attempts: ${attemptCount}`);

    if (attemptCount > 0) {
      console.log('\n📋 Sample quiz attempts:');
      const sampleAttempts = await prisma.quizAttempt.findMany({
        take: 5,
        include: {
          userProfile: {
            select: {
              userId: true,
              userType: true
            }
          },
          quiz: {
            select: {
              title: true
            }
          }
        }
      });

      sampleAttempts.forEach((attempt, index) => {
        console.log(`   ${index + 1}. Quiz: "${attempt.quiz.title}"`);
        console.log(`      User Profile ID: ${attempt.userProfileId}`);
        console.log(`      External User ID: ${attempt.userProfile.userId}`);
        console.log(`      Status: ${attempt.status}`);
        console.log('');
      });

      console.log('⚠️ Found existing quiz attempts. These will need to be migrated.');
      console.log('💡 The migration will map userProfileId to userId from UserProfile table.');
    } else {
      console.log('✅ No existing quiz attempts found. Migration will be clean.');
    }

  } catch (error) {
    console.error('❌ Error checking quiz attempts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  checkQuizAttempts()
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkQuizAttempts };