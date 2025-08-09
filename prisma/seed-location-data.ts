import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Indian Tier 1 cities (Major metros)
const INDIAN_TIER1_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Delhi', state: 'Delhi' },
  { name: 'Bangalore', state: 'Karnataka' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Pune', state: 'Maharashtra' },
  { name: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Gurgaon', state: 'Haryana' },
  { name: 'Noida', state: 'Uttar Pradesh' },
//No need these below cities now
  /** Teir 2 cities */
 /* { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Surat', state: 'Gujarat' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Nagpur', state: 'Maharashtra' },
  { name: 'Indore', state: 'Madhya Pradesh' },
  { name: 'Bhopal', state: 'Madhya Pradesh' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { name: 'Patna', state: 'Bihar' },
  { name: 'Vadodara', state: 'Gujarat' },
  { name: 'Ludhiana', state: 'Punjab' },
  { name: 'Agra', state: 'Uttar Pradesh' },
  { name: 'Nashik', state: 'Maharashtra' },
  { name: 'Faridabad', state: 'Haryana' },
  { name: 'Meerut', state: 'Uttar Pradesh' },
  { name: 'Rajkot', state: 'Gujarat' },
  { name: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Srinagar', state: 'Jammu and Kashmir' },
  { name: 'Aurangabad', state: 'Maharashtra' },
  { name: 'Amritsar', state: 'Punjab' },
  { name: 'Allahabad', state: 'Uttar Pradesh' },
  { name: 'Ranchi', state: 'Jharkhand' },
  { name: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'Jabalpur', state: 'Madhya Pradesh' },
  { name: 'Gwalior', state: 'Madhya Pradesh' },
  { name: 'Vijayawada', state: 'Andhra Pradesh' },
  { name: 'Jodhpur', state: 'Rajasthan' },
  { name: 'Madurai', state: 'Tamil Nadu' },
  { name: 'Raipur', state: 'Chhattisgarh' },
  { name: 'Kota', state: 'Rajasthan' },
  { name: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Guwahati', state: 'Assam' },
  { name: 'Mysore', state: 'Karnataka' },
  { name: 'Gurgaon', state: 'Haryana' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Salem', state: 'Tamil Nadu' },
  { name: 'Thiruvananthapuram', state: 'Kerala' },
  { name: 'Jamshedpur', state: 'Jharkhand' },
  { name: 'Kochi', state: 'Kerala' },
  { name: 'Dehradun', state: 'Uttarakhandh' },
  { name: 'Guwahati', state: 'Assam' },
  { name: 'Solapur', state: 'Maharashtra' },
  { name: 'Hubli-Dharwad', state: 'Karnataka' },
  { name: 'Bareilly', state: 'Uttar Pradesh' },
  { name: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Mysore', state: 'Karnataka' },
  { name: 'Aligarh', state: 'Uttar Pradesh' },
  { name: 'Jalandhar', state: 'Punjab' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Salem', state: 'Tamil Nadu' },
  { name: 'Warangal', state: 'Telangana' },
  { name: 'Mira-Bhayandar', state: 'Maharashtra' },
  { name: 'Thiruvananthapuram', state: 'Kerala' },
  { name: 'Bhiwandi', state: 'Maharashtra' },
  { name: 'Saharanpur', state: 'Uttar Pradesh' },
  { name: 'Guntur', state: 'Andhra Pradesh' },
  { name: 'Amravati', state: 'Maharashtra' },
  { name: 'Bikaner', state: 'Rajasthan' },
  { name: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Jamshedpur', state: 'Jharkhand' },
  { name: 'Bhilai Nagar', state: 'Chhattisgarh' },
  { name: 'Cuttack', state: 'Odisha' },
  { name: 'Firozabad', state: 'Uttar Pradesh' },
  { name: 'Kochi', state: 'Kerala' },
  { name: 'Bhavnagar', state: 'Gujarat' },
  { name: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Durgapur', state: 'West Bengal' },
  { name: 'Asansol', state: 'West Bengal' },
  { name: 'Nanded-Waghala', state: 'Maharashtra' },
  { name: 'Kolhapur', state: 'Maharashtra' },
  { name: 'Ajmer', state: 'Rajasthan' },
  { name: 'Gulbarga', state: 'Karnataka' },
  { name: 'Jamnagar', state: 'Gujarat' },
  { name: 'Ujjain', state: 'Madhya Pradesh' },
  { name: 'Loni', state: 'Uttar Pradesh' },
  { name: 'Siliguri', state: 'West Bengal' },
  { name: 'Jhansi', state: 'Uttar Pradesh' },
  { name: 'Ulhasnagar', state: 'Maharashtra' },
  { name: 'Nellore', state: 'Andhra Pradesh' },
  { name: 'Jammu', state: 'Jammu and Kashmir' },
  { name: 'Sangli-Miraj & Kupwad', state: 'Maharashtra' },
  { name: 'Mangalore', state: 'Karnataka' },
  { name: 'Erode', state: 'Tamil Nadu' },
  { name: 'Belgaum', state: 'Karnataka' },
  { name: 'Ambattur', state: 'Tamil Nadu' },
  { name: 'Tirunelveli', state: 'Tamil Nadu' },
  { name: 'Malegaon', state: 'Maharashtra' },
  { name: 'Gaya', state: 'Bihar' },
  { name: 'Jalgaon', state: 'Maharashtra' },
  { name: 'Udaipur', state: 'Rajasthan' },
  { name: 'Maheshtala', state: 'West Bengal' }*/
];

async function seedLocationData() {
  console.log('🌍 Starting location data seeding...');

  try {
    // Create India as the country
    console.log('📍 Creating India as country...');
    const india = await prisma.country.upsert({
      where: { name: 'India' },
      update: {},
      create: {
        name: 'India',
        code: 'IN',
      },
    });
    console.log(`✅ Country created: ${india.name} (${india.code})`);

    // Get unique states from the metros list
    const uniqueStates = [...new Set(INDIAN_TIER1_CITIES.map(metro => metro.state))];
    console.log(`📍 Creating ${uniqueStates.length} states...`);

    // Create states
    const stateMap = new Map();
    for (const stateName of uniqueStates) {
      const state = await prisma.state.upsert({
        where: {
          name_countryId: {
            name: stateName,
            countryId: india.id,
          },
        },
        update: {},
        create: {
          name: stateName,
          countryId: india.id,
        },
      });
      stateMap.set(stateName, state);
      console.log(`  ✅ State created: ${state.name}`);
    }
    // Create cities
    console.log(`🏙️ Creating ${INDIAN_TIER1_CITIES.length} Tier 1 cities...`);
    let cityCount = 0;
    for (const city of INDIAN_TIER1_CITIES) {
      const state = stateMap.get(city.state);
      if (state) {
        const createdCity = await prisma.city.upsert({
          where: {
            name_stateId: {
              name: city.name,
              stateId: state.id,
            },
          },
          update: {},
          create: {
            name: city.name,
            stateId: state.id,
          },
        });
        cityCount++;
        console.log(`  ✅ City created: ${createdCity.name}, ${city.state}`);
      }
    }

    // Create sample locations for each city
    console.log('📍 Creating location entries for cities...');
    const cities = await prisma.city.findMany({
      include: { state: { include: { country: true } } },
    });

    let locationCount = 0;
    for (const city of cities) {
      const location = await prisma.location.create({
        data: {
          cityId: city.id,
        },
      });
      locationCount++;
    }

    console.log(`✅ Created ${locationCount} location entries`);

    // Summary
    console.log('\n🎉 Location data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Countries: 1 (India)`);
    console.log(`   - States: ${uniqueStates.length}`);
    console.log(`   - Tier 1 Cities: ${cityCount}`);
    console.log(`   - Locations: ${locationCount}`);

    // Display all Tier 1 cities created
    console.log('\n📋 Tier 1 cities created:');
    const allCities = await prisma.city.findMany({
      include: {
        state: {
          include: {
            country: true,
          },
        },
      },
      orderBy: [
        { state: { name: 'asc' } },
        { name: 'asc' }
      ],
    });

    allCities.forEach(city => {
      console.log(`   - ${city.name}, ${city.state.name}, ${city.state.country.name}`);
    });

  } catch (error) {
    console.error('❌ Error seeding location data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedLocationData()
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedLocationData };