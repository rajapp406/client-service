# Quiz Attempt Module

The Quiz Attempt Module manages student quiz attempts, tracking progress, scores, and completion status. It provides comprehensive functionality for quiz session management and performance analytics.

## Features

- **CRUD Operations**: Create, read, update, and delete quiz attempts
- **Status Management**: Track attempt status (in progress, completed, abandoned, paused)
- **Score Tracking**: Record scores, time spent, and detailed performance metrics
- **Session Control**: Pause, resume, complete, and abandon quiz attempts
- **Performance Analytics**: Generate statistics and insights
- **Validation**: Input validation with proper error handling
- **Conflict Prevention**: Prevents multiple active attempts for same quiz/student

## API Endpoints

### Create Quiz Attempt
```
POST /quiz-attempts
```
Creates a new quiz attempt for a student.

**Request Body:**
```json
{
  "quizId": "123e4567-e89b-12d3-a456-426614174000",
  "studentId": "123e4567-e89b-12d3-a456-426614174001",
  "status": "IN_PROGRESS"
}
```

### Get All Quiz Attempts
```
GET /quiz-attempts
GET /quiz-attempts?includeQuiz=true&includeStudent=true&includeAnswers=true
```
Retrieves all quiz attempts with optional related data.

### Get Quiz Attempt Statistics
```
GET /quiz-attempts/statistics?quizId=uuid&studentId=uuid
```
Retrieves performance statistics and analytics.

### Get Attempts by Status
```
GET /quiz-attempts/by-status/IN_PROGRESS?includeRelations=true
```
Retrieves quiz attempts filtered by status.

### Get Attempts by Quiz
```
GET /quiz-attempts/quiz/:quizId?includeRelations=true
```
Retrieves all attempts for a specific quiz.

### Get Attempts by Student
```
GET /quiz-attempts/student/:studentId?includeRelations=true
```
Retrieves all attempts for a specific student.

### Complete Quiz Attempt
```
POST /quiz-attempts/:id/complete
```
Completes a quiz attempt with final scores.

**Request Body:**
```json
{
  "timeSpent": 1800,
  "score": 85.5,
  "totalQuestions": 20,
  "correctAnswers": 17,
  "totalPoints": 85,
  "maxPoints": 100
}
```

### Session Control
```
POST /quiz-attempts/:id/pause     # Pause attempt
POST /quiz-attempts/:id/resume    # Resume paused attempt
POST /quiz-attempts/:id/abandon   # Abandon attempt
```

### Update Quiz Attempt
```
PATCH /quiz-attempts/:id
```
Updates quiz attempt information.

### Delete Quiz Attempt
```
DELETE /quiz-attempts/:id
```
Deletes a quiz attempt and all associated data.

## Data Model

### Quiz Attempt Entity
```typescript
interface QuizAttempt {
  id: string;                    // UUID
  quizId: string;               // Quiz ID (foreign key)
  studentId: string;            // Student ID (foreign key)
  startedAt: Date;              // Start timestamp
  completedAt?: Date | null;    // Completion timestamp
  timeSpent?: number | null;    // Time in seconds
  score?: number | null;        // Percentage score (0-100)
  totalQuestions?: number | null; // Total questions
  correctAnswers?: number | null; // Correct answers
  totalPoints?: number | null;   // Points earned
  maxPoints?: number | null;     // Maximum points
  status: AttemptStatus;         // Current status
}
```

### Attempt Status Enum
```typescript
enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  PAUSED = 'PAUSED'
}
```

### Database Schema
```prisma
model QuizAttempt {
  id             String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  quiz           Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  quizId         String       @db.Uuid
  student        Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  studentId      String       @db.Uuid
  startedAt      DateTime     @default(now())
  completedAt    DateTime?
  timeSpent      Int?
  score          Float?
  totalQuestions Int?
  correctAnswers Int?
  totalPoints    Int?
  maxPoints      Int?
  status         AttemptStatus @default(IN_PROGRESS)
  answers        QuizAnswer[]

  @@index([quizId])
  @@index([studentId])
  @@index([status])
}
```

## Validation Rules

### Create Quiz Attempt DTO
- **quizId**: Required UUID
- **studentId**: Required UUID
- **timeSpent**: Optional number, 0-86400 seconds
- **score**: Optional number, 0-100
- **totalQuestions**: Optional number, 1-1000
- **correctAnswers**: Optional number, 0-1000
- **totalPoints**: Optional number, 0-100000
- **maxPoints**: Optional number, 1-100000
- **status**: Optional AttemptStatus enum

### Complete Quiz Attempt DTO
- **timeSpent**: Required number, 0-86400 seconds
- **score**: Required number, 0-100
- **totalQuestions**: Required number, 1-1000
- **correctAnswers**: Required number, 0-1000
- **totalPoints**: Required number, 0-100000
- **maxPoints**: Required number, 1-100000

### Business Rules
- Only one active attempt per quiz/student combination
- Quiz and student must exist before creating attempt
- Only in-progress attempts can be completed, paused, or abandoned
- Only paused attempts can be resumed

## Error Handling

### HTTP Status Codes
- **200**: Success (GET, PATCH, POST actions)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation errors, invalid status transitions)
- **404**: Not Found (attempt, quiz, or student doesn't exist)
- **409**: Conflict (active attempt already exists)

## Service Methods

### Core CRUD Operations
- `create(createQuizAttemptDto)`: Create new attempt
- `findAll(params)`: Get all attempts with filtering/pagination
- `findOne(id, includeRelations)`: Get attempt by ID
- `update(id, updateQuizAttemptDto)`: Update attempt
- `remove(id)`: Delete attempt

### Status Management
- `complete(id, completeQuizAttemptDto)`: Complete attempt
- `abandon(id)`: Abandon attempt
- `pause(id)`: Pause attempt
- `resume(id)`: Resume paused attempt

### Query Operations
- `getAttemptsByQuiz(quizId, includeRelations)`: Get attempts for quiz
- `getAttemptsByStudent(studentId, includeRelations)`: Get attempts for student
- `getAttemptsByStatus(status, includeRelations)`: Get attempts by status
- `getAttemptStatistics(quizId?, studentId?)`: Get performance statistics

## Testing

### Unit Tests
- Service layer tests with mocked Prisma
- Controller tests with mocked service
- DTO validation tests
- Status transition logic tests
- Error handling tests
- Statistics calculation tests

Run tests:
```bash
npm test quiz-attempt.service.spec.ts
npm test quiz-attempt.controller.spec.ts
```

## Dependencies

- **@nestjs/common**: Core NestJS functionality
- **@nestjs/swagger**: API documentation
- **class-validator**: DTO validation
- **prisma**: Database ORM
- **uuid**: UUID validation

## Usage Examples

### Creating a Quiz Attempt
```typescript
const attempt = await quizAttemptService.create({
  quizId: 'quiz-uuid',
  studentId: 'student-uuid'
});
```

### Completing a Quiz Attempt
```typescript
const completed = await quizAttemptService.complete('attempt-uuid', {
  timeSpent: 1800,
  score: 85.5,
  totalQuestions: 20,
  correctAnswers: 17,
  totalPoints: 85,
  maxPoints: 100
});
```

### Getting Statistics
```typescript
const stats = await quizAttemptService.getAttemptStatistics('quiz-uuid');
// Returns: { totalAttempts, completedAttempts, completionRate, averageScore, averageTimeSpent }
```

## Integration with Other Modules

### Quiz Module
- Validates quiz existence before creating attempts
- Provides quiz information in attempt responses

### Student Module
- Validates student existence before creating attempts
- Links attempts to student records

### Quiz Answer Module
- Tracks individual question answers within attempts
- Calculates scores based on answer correctness

### Leaderboard Module
- Quiz completion can trigger leaderboard updates
- Performance data feeds into ranking calculations

## Performance Analytics

### Available Statistics
- **Total Attempts**: Count of all attempts
- **Completed Attempts**: Count of completed attempts
- **Completion Rate**: Percentage of completed attempts
- **Average Score**: Mean score across completed attempts
- **Average Time Spent**: Mean time spent on completed attempts

### Filtering Options
- By quiz: Statistics for specific quiz
- By student: Statistics for specific student
- By status: Statistics for specific attempt status
- By date range: Time-based analytics (future enhancement)

## Future Enhancements

- **Real-time Progress**: WebSocket-based live progress updates
- **Attempt Recovery**: Resume interrupted attempts after system failures
- **Detailed Analytics**: Question-level performance analysis
- **Time Limits**: Automatic completion when time expires
- **Attempt History**: Detailed audit trail of attempt changes
- **Bulk Operations**: Mass operations on multiple attempts
- **Export Functionality**: CSV/PDF export of attempt data
- **Cheating Detection**: Anomaly detection in attempt patterns