# School Module

The School Module provides CRUD operations and management functionality for schools in the education platform. It includes leaderboard integration and search capabilities.

## Features

- **CRUD Operations**: Create, read, update, and delete schools
- **Search Functionality**: Search schools by name or location
- **Location Filtering**: Filter schools by specific locations
- **Leaderboard Integration**: Get school with associated leaderboard data
- **Validation**: Input validation with proper error handling
- **Conflict Prevention**: Prevents duplicate schools with same name and location

## API Endpoints

### Create School
```
POST /schools
```
Creates a new school with name and location.

**Request Body:**
```json
{
  "name": "Delhi Public School",
  "location": "New Delhi, India"
}
```

### Get All Schools
```
GET /schools
GET /schools?search=Delhi
GET /schools?location=New Delhi
```
Retrieves all schools with optional search and location filtering.

### Get School by ID
```
GET /schools/:id
```
Retrieves a specific school by its UUID.

### Get School with Leaderboard
```
GET /schools/:id/leaderboard
```
Retrieves a school with its associated leaderboard (top 10 students).

### Update School
```
PATCH /schools/:id
```
Updates school information.

**Request Body:**
```json
{
  "name": "Updated School Name",
  "location": "Updated Location"
}
```

### Delete School
```
DELETE /schools/:id
```
Deletes a school and all associated data.

## Data Model

### School Entity
```typescript
interface School {
  id: string;           // UUID
  name: string;         // School name (2-100 characters)
  location: string;     // School location (2-200 characters)
  createdAt?: Date;     // Creation timestamp
  updatedAt?: Date;     // Last update timestamp
}
```

### Database Schema
```prisma
model School {
  id           String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String        // School Name
  location     String        // Location
  leaderboards Leaderboard[]
}
```

## Validation Rules

### Create/Update School DTO
- **name**: Required string, 2-100 characters
- **location**: Required string, 2-200 characters

### Business Rules
- No duplicate schools with same name and location
- School name and location are required fields
- UUID validation for all ID parameters

## Error Handling

### HTTP Status Codes
- **200**: Success (GET, PATCH)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation errors)
- **404**: Not Found (school doesn't exist)
- **409**: Conflict (duplicate school)

### Error Responses
```json
{
  "statusCode": 409,
  "message": "School with this name and location already exists",
  "error": "Conflict"
}
```

## Service Methods

### Core CRUD Operations
- `create(createSchoolDto)`: Create new school
- `findAll(params)`: Get all schools with pagination/filtering
- `findOne(id)`: Get school by ID
- `update(id, updateSchoolDto)`: Update school
- `remove(id)`: Delete school

### Search Operations
- `searchSchools(params)`: Search by name/location
- `getSchoolWithLeaderboard(id)`: Get school with leaderboard data

## Testing

### Unit Tests
- Service layer tests with mocked Prisma
- Controller tests with mocked service
- DTO validation tests
- Error handling tests

### Test Coverage
- All CRUD operations
- Search functionality
- Validation scenarios
- Error conditions
- Leaderboard integration

Run tests:
```bash
npm test school.service.spec.ts
npm test school.controller.spec.ts
```

## Dependencies

- **@nestjs/common**: Core NestJS functionality
- **@nestjs/swagger**: API documentation
- **class-validator**: DTO validation
- **prisma**: Database ORM
- **uuid**: UUID validation

## Integration

### Module Registration
The SchoolModule is registered in `app.module.ts`:

```typescript
@Module({
  imports: [
    // ... other modules
    SchoolModule,
  ],
})
export class AppModule {}
```

### Database Migration
Ensure the School model is included in your Prisma schema and run migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

## Usage Examples

### Creating a School
```typescript
const school = await schoolService.create({
  name: 'Delhi Public School',
  location: 'New Delhi, India'
});
```

### Searching Schools
```typescript
const schools = await schoolService.searchSchools({
  search: 'Delhi',
  location: 'New Delhi'
});
```

### Getting School with Leaderboard
```typescript
const schoolWithLeaderboard = await schoolService.getSchoolWithLeaderboard('school-id');
```

## Future Enhancements

- **Bulk Operations**: Import/export multiple schools
- **Advanced Search**: Full-text search with ranking
- **Geolocation**: GPS coordinates and distance-based search
- **School Analytics**: Statistics and reporting
- **File Upload**: School logos and images
- **Hierarchical Structure**: Support for school districts/regions