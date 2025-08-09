import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function truncateSchoolTable() {
  console.log('🗑️ Starting school table truncation...\n');

  try {
    // First, let's check what data exists
    console.log('📊 Checking current data...');
    const [schoolCount, leaderboardCount, userProfileCount] = await Promise.all([
      prisma.school.count(),
      prisma.leaderboard.count(),
      prisma.userProfile.count({ where: { schoolId: { not: null } } }),
    ]);

    console.log(`   - Schools: ${schoolCount}`);
    console.log(`   - Leaderboards: ${leaderboardCount}`);
    console.log(`   - User profiles with schools: ${userProfileCount}`);

    if (schoolCount === 0) {
      console.log('✅ School table is already empty. Nothing to truncate.');
      return;
    }

    // Warn about cascading deletes
    console.log('\n⚠️  WARNING: This will delete:');
    console.log(`   - ${schoolCount} schools`);
    console.log(`   - ${leaderboardCount} leaderboard entries (cascading delete)`);
    console.log(`   - User profiles will have their schoolId set to null`);

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      console.log('\n🔄 Starting transaction...');

      // Step 1: Update user profiles to remove school associations
      console.log('1. Updating user profiles to remove school associations...');
      const updatedProfiles = await tx.userProfile.updateMany({
        where: { schoolId: { not: null } },
        data: { schoolId: null },
      });
      console.log(`   ✅ Updated ${updatedProfiles.count} user profiles`);

      // Step 2: Delete all leaderboard entries (will cascade from schools)
      console.log('2. Deleting leaderboard entries...');
      const deletedLeaderboards = await tx.leaderboard.deleteMany({});
      console.log(`   ✅ Deleted ${deletedLeaderboards.count} leaderboard entries`);

      // Step 3: Delete all schools
      console.log('3. Deleting all schools...');
      const deletedSchools = await tx.school.deleteMany({});
      console.log(`   ✅ Deleted ${deletedSchools.count} schools`);
    });

    // Verify truncation
    console.log('\n🔍 Verifying truncation...');
    const [finalSchoolCount, finalLeaderboardCount] = await Promise.all([
      prisma.school.count(),
      prisma.leaderboard.count(),
    ]);

    console.log(`   - Schools remaining: ${finalSchoolCount}`);
    console.log(`   - Leaderboards remaining: ${finalLeaderboardCount}`);

    if (finalSchoolCount === 0 && finalLeaderboardCount === 0) {
      console.log('\n🎉 School table truncation completed successfully!');
      console.log('✅ All schools and related data have been removed');
      console.log('✅ User profiles have been updated to remove school associations');
    } else {
      console.log('\n❌ Truncation may not have completed successfully');
    }

  } catch (error) {
    console.error('❌ Error during school table truncation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the truncation function
if (require.main === module) {
  truncateSchoolTable()
    .catch((error) => {
      console.error('❌ Truncation failed:', error);
      process.exit(1);
    });
}

export { truncateSchoolTable };