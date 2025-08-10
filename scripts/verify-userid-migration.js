const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function verifyUserIdMigration() {
  console.log('🔍 Verifying userId migration...\n');

  try {
    // Check quiz attempts with new userId field
    const attempts = await prisma.quizAttempt.findMany({
      include: {
        quiz: {
          select: {
            title: true
          }
        }
      }
    });

    console.log(`📊 Total quiz attempts after migration: ${attempts.length}`);

    if (attempts.length > 0) {
      console.log('\n📋 Quiz attempts with new userId field:');
      attempts.forEach((attempt, index) => {
        console.log(`   ${index + 1}. Quiz: "${attempt.quiz.title}"`);
        console.log(`      User ID: ${attempt.userId}`);
        console.log(`      Status: ${attempt.status}`);
        console.log(`      Started: ${attempt.startedAt.toISOString()}`);
        console.log('');
      });

      // Verify that userIds exist in UserProfile table
      console.log('🔗 Verifying userId references...');
      const userIds = [...new Set(attempts.map(a => a.userId))];
      
      for (const userId of userIds) {
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId },
          select: { userId: true, userType: true }
        });
        
        if (userProfile) {
          console.log(`   ✅ User ${userId} exists in UserProfile`);
        } else {
          console.log(`   ❌ User ${userId} NOT found in UserProfile`);
        }
      }
    }

    console.log('\n✅ Migration verification completed successfully!');

  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  verifyUserIdMigration()
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyUserIdMigration };