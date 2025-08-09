# Location Module

The Location Module provides comprehensive CRUD operations for managing hierarchical location data including Countries, States, Cities, and Locations. It supports the complete location hierarchy used throughout the education platform.

## Features

- **Complete CRUD Operations**: Full Create, Read, Update, Delete for all location entities
- **Hierarchical Structure**: Country → State → City → Location relationships
- **Search Functionality**: Search across cities, states, and countries
- **Statistics**: Location analytics and reporting
- **Validation**: Comprehensive input validation and business rules
- **Conflict Prevention**: Prevents duplicate entries at each level
- **Relationship Management**: Proper foreign key relationships and cascading

## API Endpoints

### Statistics & Search (2 endpoints)
- `GET /locations/statistics` - Get location statistics
- `GET /locations/search?q=query` - Search locations

### Country Management (5 endpoints)
- `POST /locations/countries` - Create country
- `GET /locations/countries` - List all countries
- `GET /locations/countries/:id` - Get country by ID
- `PATCH /locations/countries/:id` - Update country
- `DELETE /locations/countries/:id` - Delete country

### State Management (6 endpoints)
- `POST /locations/states` - Create state
- `GET /locations/states` - List all states
- `GET /locations/states/:id` - Get state by ID
- `GET /locations/countries/:countryId/states` - Get states by country
- `PATCH /locations/states/:id` - Update state
- `DELETE /locations/states/:id` - Delete state

### City Management (6 endpoints)
- `POST /locations/cities` - Create city
- `GET /locations/cities` - List all cities
- `GET /locations/cities/:id` - Get city by ID
- `GET /locations/states/:stateId/cities` - Get cities by state
- `PATCH /locations/cities/:id` - Update city
- `DELETE /locations/cities/:id` - Delete city

### Location Management (6 endpoints)
- `POST /locations` - Create location
- `GET /locations` - List all locations
- `GET /locations/:id` - Get location by ID
- `GET /locations/cities/:cityId/locations` - Get locations by city
- `PATCH /locations/:id` - Update location
- `DELETE /locations/:id` - Delete location

**Total: 25 API endpoints**

## Data Models

### Country Entity
```typescript
interface Country {
  id: string;           // UUID
  name: string;         // Country name (unique)
  code?: string | null; // ISO country code (optional)
  states?: State[];     // Related states
}
```

### State Entity
```typescript
interface State {
  id: string;           // UUID
  name: string;         // State name
  countryId: string;    // Country ID (foreign key)
  country?: Country;    // Related country
  cities?: City[];      // Related cities
}
```

### City Entity
```typescript
interface City {
  id: string;           // UUID
  name: string;         // City name
  stateId: string;      // State ID (foreign key)
  state?: State;        // Related state with country
  locations?: Location[]; // Related locations
}
```

### Location Entity
```typescript
interface Location {
  id: string;           // UUID
  cityId: string;       // City ID (foreign key)
  city?: City;          // Related city with full hierarchy
  profiles?: UserProfile[]; // User profiles using this location
}
```

## Database Schema

```prisma
model Country {
  id       String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name     String  @unique
  code     String? @db.VarChar(10)
  states   State[]

  @@index([name])
}

model State {
  id        String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  country   Country @relation(fields: [countryId], references: [id], onDelete: Cascade)
  countryId String  @db.Uuid
  cities    City[]

  @@unique([name, countryId])
  @@index([countryId])
}

model City {
  id        String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  state     State      @relation(fields: [stateId], references: [id], onDelete: Cascade)
  stateId   String     @db.Uuid
  locations Location[]

  @@unique([name, stateId])
  @@index([stateId])
}

model Location {
  id       String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  cityId   String        @db.Uuid
  city     City          @relation(fields: [cityId], references: [id], onDelete: Cascade)
  profiles UserProfile[]

  @@index([cityId])
}
```

## Validation Rules

### Country DTO
- **name**: Required string, 2-100 characters, unique
- **code**: Optional string, 2-10 characters

### State DTO
- **name**: Required string, 2-100 characters
- **countryId**: Required UUID
- **Unique constraint**: name + countryId combination

### City DTO
- **name**: Required string, 2-100 characters
- **stateId**: Required UUID
- **Unique constraint**: name + stateId combination

### Location DTO
- **cityId**: Required UUID

## Business Rules

### Hierarchical Integrity
- Countries can exist independently
- States must belong to a valid country
- Cities must belong to a valid state
- Locations must belong to a valid city

### Uniqueness Constraints
- Country names are globally unique
- State names are unique within a country
- City names are unique within a state
- No uniqueness constraint on locations (multiple locations per city allowed)

### Cascading Deletes
- Deleting a country removes all its states, cities, and locations
- Deleting a state removes all its cities and locations
- Deleting a city removes all its locations
- Deleting a location only affects that specific location

## Error Handling

### HTTP Status Codes
- **200**: Success (GET, PATCH, POST actions)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation errors)
- **404**: Not Found (entity doesn't exist)
- **409**: Conflict (duplicate names, foreign key violations)

### Error Examples
```json
{
  "statusCode": 409,
  "message": "Country with this name already exists",
  "error": "Conflict"
}

{
  "statusCode": 404,
  "message": "State with ID abc123 not found",
  "error": "Not Found"
}
```

## Service Methods

### Country Operations (5 methods)
- `createCountry(dto)`: Create new country
- `findAllCountries(includeStates)`: Get all countries
- `findCountryById(id, includeStates)`: Get country by ID
- `updateCountry(id, dto)`: Update country
- `removeCountry(id)`: Delete country

### State Operations (6 methods)
- `createState(dto)`: Create new state
- `findAllStates(includeCountry, includeCities)`: Get all states
- `findStateById(id, includeRelations)`: Get state by ID
- `findStatesByCountry(countryId, includeCities)`: Get states by country
- `updateState(id, dto)`: Update state
- `removeState(id)`: Delete state

### City Operations (6 methods)
- `createCity(dto)`: Create new city
- `findAllCities(includeRelations)`: Get all cities
- `findCityById(id, includeRelations)`: Get city by ID
- `findCitiesByState(stateId, includeLocations)`: Get cities by state
- `updateCity(id, dto)`: Update city
- `removeCity(id)`: Delete city

### Location Operations (6 methods)
- `createLocation(dto)`: Create new location
- `findAllLocations(includeRelations)`: Get all locations
- `findLocationById(id, includeRelations)`: Get location by ID
- `findLocationsByCity(cityId, includeProfiles)`: Get locations by city
- `updateLocation(id, dto)`: Update location
- `removeLocation(id)`: Delete location

### Utility Operations (2 methods)
- `searchLocations(query)`: Search across all location levels
- `getLocationStatistics()`: Get count statistics

## Usage Examples

### Creating Location Hierarchy
```typescript
// 1. Create country
const country = await locationService.createCountry({
  name: 'India',
  code: 'IN'
});

// 2. Create state
const state = await locationService.createState({
  name: 'Maharashtra',
  countryId: country.id
});

// 3. Create city
const city = await locationService.createCity({
  name: 'Mumbai',
  stateId: state.id
});

// 4. Create location
const location = await locationService.createLocation({
  cityId: city.id
});
```

### Searching Locations
```typescript
// Search for locations containing "Mumbai"
const results = await locationService.searchLocations('Mumbai');

// Results include full hierarchy:
// [
//   {
//     id: "location-uuid",
//     cityId: "city-uuid",
//     city: {
//       name: "Mumbai",
//       state: {
//         name: "Maharashtra",
//         country: {
//           name: "India",
//           code: "IN"
//         }
//       }
//     }
//   }
// ]
```

### Getting Statistics
```typescript
const stats = await locationService.getLocationStatistics();
// Returns: { countries: 1, states: 9, cities: 10, locations: 10 }
```

## Integration with Other Modules

### UserProfile Module
- UserProfile entities reference Location IDs
- Location deletion affects user profiles
- Location search helps in profile filtering

### School Module
- Schools can be associated with locations
- Location-based school searches
- Regional school management

## Performance Considerations

### Database Optimizations
- **Indexing**: Proper indexes on foreign keys and search fields
- **Unique Constraints**: Database-level uniqueness enforcement
- **Cascading**: Efficient cascading deletes
- **Query Optimization**: Selective includes to avoid over-fetching

### API Performance
- **Pagination**: Built-in support for large datasets
- **Selective Loading**: Optional relation loading
- **Search Limits**: Search results limited to 50 items
- **Caching Ready**: Structure supports future caching

## Current Data

### Seeded Data (from seed script)
- **1 Country**: India (IN)
- **9 States**: Major Indian states
- **10 Cities**: Tier 1 Indian metro cities
- **10 Locations**: One per city

### Available Cities
- Mumbai, Maharashtra
- Delhi, Delhi
- Bangalore, Karnataka
- Hyderabad, Telangana
- Chennai, Tamil Nadu
- Kolkata, West Bengal
- Pune, Maharashtra
- Ahmedabad, Gujarat
- Gurgaon, Haryana
- Noida, Uttar Pradesh

## Future Enhancements

### Immediate Opportunities
- **Bulk Operations**: Import/export location data
- **Geolocation**: Add GPS coordinates to cities/locations
- **Timezone Support**: Add timezone information
- **Postal Codes**: Add postal/ZIP code support

### Long-term Possibilities
- **Multi-country Expansion**: Support for more countries
- **Distance Calculations**: Geographic distance queries
- **Location Analytics**: Usage patterns and insights
- **Address Management**: Full address support with street-level data
- **Map Integration**: Integration with mapping services

---

## ✅ **LOCATION MODULE COMPLETE**

The LocationModule provides comprehensive CRUD operations for all location-related data with proper hierarchical relationships, validation, and error handling. It includes 25 API endpoints covering all aspects of location management from countries down to specific locations.

**Total Implementation**: 4 entities, 25 API endpoints, comprehensive validation, full CRUD operations, search functionality, and statistics reporting.