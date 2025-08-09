# Leaderboard Module

The Leaderboard Module manages student rankings and scores within schools. It provides functionality to track student performance, update rankings, and retrieve leaderboard data.

## Features

- **CRUD Operations**: Create, read, update, and delete leaderboard entries
- **School-based Rankings**: Get leaderboard entries for specific schools
- **User Performance Tracking**: Track individual user performance across schools
- **Automatic Ranking Updates**: Update rankings based on total scores
- **Top Performers**: Get top performers across all schools
- **Validation**: Input validation with proper error handling
- **Conflict Prevention**: Prevents duplicate entries for same user and school

## API Endpoints

### Create Leaderboard Entry
```
POST /leaderboards
```
Creates a new leaderboard entry for a user in a school.

**Request Body:**
```json
{
  "schoolId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "totalScore": 1250,
  "rank": 1
}
```

### Get All Leaderboard Entries
```
GET /leaderboards
GET /leaderboards?includeSchool=true&limit=20
```
Retrieves all leaderboard entries with optional school information.

### Get Top Performers
```
GET /leaderboards/top-performers?limit=10
```
Retrieves top performers across all schools.

### Get School Leaderboard
```
GET /leaderboards/school/:schoolId?limit=10&includeSchool=true
```
Retrieves leaderboard entries for a specific school.

### Get User Leaderboard
```
GET /leaderboards/user/:userId?includeSchool=true
```
Retrieves leaderboard entries for a specific user across all schools.

### Update Rankings
```
POST /leaderboards/school/:schoolId/update-rankings
```
Updates rankings for all users in a school based on total scores.

### Update Leaderboard Entry
```
PATCH /leaderboards/:id
```
Updates a leaderboard entry.

### Delete Leaderboard Entry
```
DELETE /leaderboards/:id
```
Deletes a leaderboard entry.

## Data Model

### Leaderboard Entity
```typescript
interface Leaderboard {
  id: string;           // UUID
  schoolId: string;     // School ID (foreign key)
  userId: string;       // User ID (external foreign key)
  totalScore: number;   // Total score (0-999999)
  rank: number;         // Rank in school (1-10000)
  createdAt?: Date;     // Creation timestamp
  updatedAt?: Date;     // Last update timestamp
}
```

### Database Schema
```prisma
model Leaderboard {
  id         String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  school     School  @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId   String  @db.Uuid
  userId     String  @db.Uuid
  totalScore Int
  rank       Int

  @@index([schoolId])
  @@index([userId])
}
```

## Validation Rules

### Create/Update Leaderboard DTO
- **schoolId**: Required UUID
- **userId**: Required UUID
- **totalScore**: Required number, 0-999999
- **rank**: Required number, 1-10000

### Business Rules
- No duplicate entries for same user and school
- School must exist before creating leaderboard entry
- Rankings are automatically updated based on total scores

## Error Handling

### HTTP Status Codes
- **200**: Success (GET, PATCH, POST actions)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation errors)
- **404**: Not Found (leaderboard entry or school doesn't exist)
- **409**: Conflict (duplicate entry)

## Service Methods

### Core CRUD Operations
- `create(createLeaderboardDto)`: Create new leaderboard entry
- `findAll(params)`: Get all entries with filtering/pagination
- `findOne(id, includeSchool)`: Get entry by ID
- `update(id, updateLeaderboardDto)`: Update entry
- `remove(id)`: Delete entry

### Specialized Operations
- `getLeaderboardBySchool(schoolId, params)`: Get school leaderboard
- `getLeaderboardByUser(userId, includeSchool)`: Get user entries
- `updateUserRankings(schoolId)`: Update rankings for school
- `getTopPerformers(limit)`: Get top performers globally

## Testing

### Unit Tests
- Service layer tests with mocked Prisma
- Controller tests with mocked service
- DTO validation tests
- Error handling tests
- Ranking update logic tests

Run tests:
```bash
npm test leaderboard.service.spec.ts
npm test leaderboard.controller.spec.ts
```

## Dependencies

- **@nestjs/common**: Core NestJS functionality
- **@nestjs/swagger**: API documentation
- **class-validator**: DTO validation
- **prisma**: Database ORM
- **uuid**: UUID validation

## Usage Examples

### Creating a Leaderboard Entry
```typescript
const entry = await leaderboardService.create({
  schoolId: 'school-uuid',
  userId: 'user-uuid',
  totalScore: 1250,
  rank: 1
});
```

### Getting School Leaderboard
```typescript
const leaderboard = await leaderboardService.getLeaderboardBySchool('school-uuid', {
  limit: 10,
  includeSchool: true
});
```

### Updating Rankings
```typescript
await leaderboardService.updateUserRankings('school-uuid');
```

## Integration with Other Modules

### School Module
- Validates school existence before creating entries
- Provides school information in leaderboard responses

### Quiz Attempt Module
- Leaderboard scores can be updated based on quiz performance
- Quiz completion can trigger ranking updates

## Future Enhancements

- **Time-based Rankings**: Historical ranking data
- **Subject-specific Leaderboards**: Rankings per subject
- **Achievement Badges**: Award system integration
- **Leaderboard Analytics**: Performance trends and insights
- **Real-time Updates**: WebSocket-based live rankings
- **Export Functionality**: CSV/PDF export of leaderboards