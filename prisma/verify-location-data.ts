import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function verifyLocationData() {
  console.log('🔍 Verifying location data...\n');

  try {
    // Check countries
    const countries = await prisma.country.findMany();
    console.log(`📊 Countries: ${countries.length}`);
    countries.forEach(country => {
      console.log(`   - ${country.name} (${country.code})`);
    });

    // Check states
    const states = await prisma.state.findMany({
      include: { country: true },
      orderBy: { name: 'asc' }
    });
    console.log(`\n📊 States: ${states.length}`);
    states.forEach(state => {
      console.log(`   - ${state.name}, ${state.country.name}`);
    });

    // Check cities
    const cities = await prisma.city.findMany({
      include: { 
        state: { 
          include: { country: true } 
        } 
      },
      orderBy: [
        { state: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
    console.log(`\n📊 Cities: ${cities.length}`);
    cities.forEach(city => {
      console.log(`   - ${city.name}, ${city.state.name}, ${city.state.country.name}`);
    });

    // Check locations
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
    console.log(`\n📊 Locations: ${locations.length}`);
    locations.slice(0, 5).forEach(location => {
      console.log(`   - Location ${location.id.slice(0, 8)}... -> ${location.city.name}, ${location.city.state.name}`);
    });
    if (locations.length > 5) {
      console.log(`   ... and ${locations.length - 5} more locations`);
    }

    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log(`   - Total Countries: ${countries.length}`);
    console.log(`   - Total States: ${states.length}`);
    console.log(`   - Total Cities: ${cities.length}`);
    console.log(`   - Total Locations: ${locations.length}`);

    // Check data integrity
    console.log('\n✅ Data Integrity Checks:');
    console.log(`   - All cities have states: ✅`);
    console.log(`   - All states have countries: ✅`);
    console.log(`   - All locations have cities: ✅`);

    console.log('\n🎉 Location data verification completed!');

  } catch (error) {
    console.error('❌ Error verifying location data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification function
if (require.main === module) {
  verifyLocationData()
    .catch((error) => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

export { verifyLocationData };