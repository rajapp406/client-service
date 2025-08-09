import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkExistingData() {
  console.log('🔍 Checking existing schools and locations...\n');

  try {
    // Check existing schools
    const schools = await prisma.school.findMany();
    console.log('📚 Existing Schools:');
    schools.forEach(school => {
      console.log(`  - ID: ${school.id.slice(0, 8)}..., Name: ${school.name}, Location: ${(school as any).location}`);
    });

    // Check available locations
    const locations = await prisma.location.findMany({
      include: {
        city: {
          include: {
            state: {
              include: { country: true }
            }
          }
        }
      }
    });
    console.log('\n📍 Available Locations:');
    locations.forEach(location => {
      console.log(`  - ID: ${location.id.slice(0, 8)}..., City: ${location.city.name}, State: ${location.city.state.name}, Country: ${location.city.state.country.name}`);
    });

    console.log(`\n📊 Summary:`);
    console.log(`  - Schools: ${schools.length}`);
    console.log(`  - Locations: ${locations.length}`);

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingData();