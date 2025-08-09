import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function truncateSchools() {
  try {
    console.log('Starting to truncate schools...');
    
    // First delete all leaderboard entries that reference schools
    console.log('Deleting leaderboard entries...');
    await prisma.leaderboard.deleteMany({});
    
    // Then delete all schools
    console.log('Deleting schools...');
    await prisma.school.deleteMany({});
    
    console.log('Successfully truncated schools table');
  } catch (error) {
    console.error('Error truncating schools:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

truncateSchools();
