import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkExistingDataRaw() {
  console.log('🔍 Checking existing schools and locations with raw SQL...\n');

  try {
    // Check existing schools with raw SQL
    const schools = await prisma.$queryRaw`SELECT * FROM "School"`;
    console.log('📚 Existing Schools:');
    console.log(schools);

    // Check available locations
    const locations = await prisma.$queryRaw`
      SELECT 
        l.id as location_id,
        l."cityId",
        c.name as city_name,
        s.name as state_name,
        co.name as country_name
      FROM "Location" l
      JOIN "City" c ON l."cityId" = c.id
      JOIN "State" s ON c."stateId" = s.id
      JOIN "Country" co ON s."countryId" = co.id
    `;
    console.log('\n📍 Available Locations:');
    console.log(locations);

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingDataRaw();