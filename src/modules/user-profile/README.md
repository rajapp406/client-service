# User Profile Module

The User Profile Module manages user profiles and onboarding data from the UI. It handles comprehensive user information including personal details, educational preferences, school associations, and interests.

## Features

- **CRUD Operations**: Create, read, update, and delete user profiles
- **Onboarding Process**: Specialized endpoint for user onboarding with interests
- **User Management**: Find profiles by user ID or profile ID
- **Search & Filtering**: Advanced search with multiple filter options
- **Interest Management**: Add and remove user interests
- **Statistics**: Profile analytics and reporting
- **Validation**: Comprehensive input validation and business rules
- **Relationship Management**: Handle school and location associations

## API Endpoints

### Create User Profile
```
POST /user-profiles
```
Creates a new user profile.

**Request Body:**
```json
{
  "userId": "user123",
  "userType": "STUDENT",
  "locationId": "123e4567-e89b-12d3-a456-426614174001",
  "schoolId": "123e4567-e89b-12d3-a456-426614174000",
  "grade": 10,
  "board": "CBSE",
  "dateOfBirth": "2000-01-01T00:00:00.000Z",
  "phoneNumber": "+1234567890",
  "parentEmail": "parent@example.com",
  "parentPhone": "+1234567891"
}
```

### Onboarding Process
```
POST /user-profiles/onboarding
```
Creates a user profile through the onboarding process with interests.

**Request Body:**
```json
{
  "userId": "user123",
  "userType": "STUDENT",
  "locationId": "123e4567-e89b-12d3-a456-426614174001",
  "schoolId": "123e4567-e89b-12d3-a456-426614174000",
  "grade": 10,
  "board": "CBSE",
  "interests": ["Mathematics", "Science", "Sports"]
}
```

### Get All Profiles
```
GET /user-profiles
GET /user-profiles?includeRelations=true&limit=20&skip=0
```
Retrieves all user profiles with optional pagination and relations.

### Get Profile Statistics
```
GET /user-profiles/statistics
```
Retrieves profile analytics and statistics.

### Search Profiles
```
GET /user-profiles/search?userType=STUDENT&grade=10&board=CBSE&search=user123
```
Advanced search with multiple filter options.

### Get Profile by User ID
```
GET /user-profiles/user/:userId?includeRelations=true
```
Retrieves profile by external user ID.

### Get Profile by ID
```
GET /user-profiles/:id?includeRelations=true
```
Retrieves profile by profile ID.

### Update Profile
```
PATCH /user-profiles/:id
PATCH /user-profiles/user/:userId
```
Updates profile by profile ID or user ID.

### Interest Management
```
POST /user-profiles/:id/interests          # Add interest
DELETE /user-profiles/:id/interests/:interest  # Remove interest
```

### Delete Profile
```
DELETE /user-profiles/:id
DELETE /user-profiles/user/:userId
```
Deletes profile by profile ID or user ID.

## Data Model

### User Profile Entity
```typescript
interface UserProfile {
  id: string;                    // UUID
  userId: string;               // External user ID (unique)
  userType: UserType;           // STUDENT, TEACHER, PARENT, ADMIN
  schoolId?: string | null;     // School ID (optional)
  locationId: string;           // Location ID (required)
  grade?: number | null;        // Grade level (1-12)
  board?: Board | null;         // Education board
  dateOfBirth?: Date | null;    // Date of birth
  phoneNumber?: string | null;  // Phone number
  parentEmail?: string | null;  // Parent email
  parentPhone?: string | null;  // Parent phone
  createdAt?: Date;             // Creation timestamp
  updatedAt?: Date;             // Last update timestamp
}
```

### User Types
```typescript
enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  ADMIN = 'ADMIN'
}
```

### Education Boards
```typescript
enum Board {
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  IB = 'IB',
  STATE = 'STATE',
  CAMBRIDGE = 'CAMBRIDGE'
}
```

### Database Schema
```prisma
model UserProfile {
  id            String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String        @unique
  userType      UserType
  schoolId      String?       @db.Uuid
  locationId    String        @db.Uuid
  grade         Int?
  board         Board?
  dateOfBirth   DateTime?
  phoneNumber   String?
  parentEmail   String?
  parentPhone   String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  school        School?       @relation(fields: [schoolId], references: [id], onDelete: SetNull)
  location      Location      @relation(fields: [locationId], references: [id], onDelete: Cascade)
  interests     UserInterest[]

  @@index([userId])
  @@index([schoolId])
  @@index([grade, board])
}
```

## Validation Rules

### Create/Update Profile DTO
- **userId**: Required string, 1-255 characters
- **userType**: Required UserType enum
- **locationId**: Required UUID
- **schoolId**: Optional UUID
- **grade**: Optional number, 1-12
- **board**: Optional Board enum
- **dateOfBirth**: Optional ISO 8601 date string
- **phoneNumber**: Optional valid phone number
- **parentEmail**: Optional valid email address
- **parentPhone**: Optional valid phone number

### Onboarding DTO
- All profile fields plus:
- **interests**: Optional array of strings, 0-10 items, 1-50 characters each

### Business Rules
- User ID must be unique across all profiles
- Location must exist before creating profile
- School must exist if provided
- Only one profile per user ID
- Interests are unique per profile

## Error Handling

### HTTP Status Codes
- **200**: Success (GET, PATCH, POST actions)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation errors)
- **404**: Not Found (profile, location, or school doesn't exist)
- **409**: Conflict (duplicate profile or interest)

## Service Methods

### Core CRUD Operations
- `create(createUserProfileDto)`: Create new profile
- `onboarding(onboardingDto)`: Create profile with interests
- `findAll(params)`: Get all profiles with filtering/pagination
- `findOne(id, includeRelations)`: Get profile by ID
- `findByUserId(userId, includeRelations)`: Get profile by user ID
- `update(id, updateDto)`: Update profile by ID
- `updateByUserId(userId, updateDto)`: Update profile by user ID
- `remove(id)`: Delete profile by ID
- `removeByUserId(userId)`: Delete profile by user ID

### Search Operations
- `searchProfiles(params)`: Advanced search with filters
- `getProfileStatistics()`: Get analytics and statistics

### Interest Management
- `addInterest(profileId, interest)`: Add interest to profile
- `removeInterest(profileId, interest)`: Remove interest from profile

## Testing

### Unit Tests
- Service layer tests with mocked Prisma
- Controller tests with mocked service
- DTO validation tests
- Error handling tests
- Transaction handling tests

Run tests:
```bash
npm test user-profile.service.spec.ts
npm test user-profile.controller.spec.ts
```

## Dependencies

- **@nestjs/common**: Core NestJS functionality
- **@nestjs/swagger**: API documentation
- **class-validator**: DTO validation
- **prisma**: Database ORM
- **uuid**: UUID validation

## Usage Examples

### Creating a Profile
```typescript
const profile = await userProfileService.create({
  userId: 'user123',
  userType: UserType.STUDENT,
  locationId: 'location-uuid',
  schoolId: 'school-uuid',
  grade: 10,
  board: Board.CBSE
});
```

### Onboarding Process
```typescript
const profile = await userProfileService.onboarding({
  userId: 'user123',
  userType: UserType.STUDENT,
  locationId: 'location-uuid',
  interests: ['Mathematics', 'Science']
});
```

### Searching Profiles
```typescript
const profiles = await userProfileService.searchProfiles({
  userType: UserType.STUDENT,
  grade: 10,
  board: Board.CBSE,
  search: 'user123'
});
```

### Getting Statistics
```typescript
const stats = await userProfileService.getProfileStatistics();
// Returns: { totalProfiles, profilesByType, profilesByGrade }
```

## Integration with Other Modules

### School Module
- Validates school existence before creating profiles
- Provides school information in profile responses

### Location Module
- Validates location existence before creating profiles
- Provides location information in profile responses

### Quiz Attempt Module
- User profiles can be linked to quiz attempts
- Student profiles provide context for quiz performance

## Onboarding Flow

The module supports a comprehensive onboarding flow:

1. **Profile Creation**: Basic profile information
2. **Interest Selection**: User interests and preferences
3. **School Association**: Link to educational institution
4. **Location Setting**: Geographic information
5. **Validation**: Comprehensive data validation
6. **Transaction Safety**: Atomic operations for data consistency

## Performance Considerations

- **Database Indexing**: Optimized indexes on userId, schoolId, grade, and board
- **Pagination Support**: Built-in pagination for large datasets
- **Selective Includes**: Optional relation loading to reduce query overhead
- **Transaction Management**: Atomic operations for complex data creation

## Future Enhancements

- **Profile Pictures**: Image upload and management
- **Social Features**: Friend connections and social interactions
- **Achievement System**: Badges and accomplishments
- **Privacy Settings**: Granular privacy controls
- **Bulk Operations**: Mass profile operations
- **Advanced Analytics**: Detailed user behavior analytics
- **Integration APIs**: Third-party service integrations
- **Notification Preferences**: User notification settings