import { ApiProperty } from '@nestjs/swagger';
import { QuizAttempt as PrismaQuizAttempt, AttemptStatus } from '../../../../generated/prisma';

interface IQuizAttempt {
  id: string;
  quizId: string;
  userProfileId: string;
  startedAt: Date;
  completedAt?: Date | null;
  timeSpent?: number | null;
  score?: number | null;
  totalQuestions?: number | null;
  correctAnswers?: number | null;
  totalPoints?: number | null;
  maxPoints?: number | null;
  status: AttemptStatus;
}

export class QuizAttempt implements IQuizAttempt {
  @ApiProperty({ description: 'Unique identifier of the quiz attempt' })
  id: string;

  @ApiProperty({ description: 'Quiz ID (foreign key)' })
  quizId: string;

  @ApiProperty({ description: 'Student ID (foreign key)' })
  userProfileId: string;

  @ApiProperty({ description: 'Date and time when the attempt was started' })
  startedAt: Date;

  @ApiProperty({ 
    description: 'Date and time when the attempt was completed',
    required: false,
    nullable: true
  })
  completedAt?: Date | null;

  @ApiProperty({ 
    example: 1800, 
    description: 'Time spent on the quiz in seconds',
    required: false,
    nullable: true
  })
  timeSpent?: number | null;

  @ApiProperty({ 
    example: 85.5, 
    description: 'Percentage score (0-100)',
    required: false,
    nullable: true
  })
  score?: number | null;

  @ApiProperty({ 
    example: 20, 
    description: 'Total number of questions in the quiz',
    required: false,
    nullable: true
  })
  totalQuestions?: number | null;

  @ApiProperty({ 
    example: 17, 
    description: 'Number of correct answers',
    required: false,
    nullable: true
  })
  correctAnswers?: number | null;

  @ApiProperty({ 
    example: 85, 
    description: 'Total points earned',
    required: false,
    nullable: true
  })
  totalPoints?: number | null;

  @ApiProperty({ 
    example: 100, 
    description: 'Maximum possible points',
    required: false,
    nullable: true
  })
  maxPoints?: number | null;

  @ApiProperty({ 
    enum: AttemptStatus,
    example: AttemptStatus.IN_PROGRESS,
    description: 'Current status of the quiz attempt'
  })
  status: AttemptStatus;

  // Optional populated relations
  @ApiProperty({ description: 'Quiz information', required: false })
  quiz?: {
    id: string;
    title: string;
    description?: string;
    timeLimit?: number;
  };

  @ApiProperty({ description: 'Student information', required: false })
  student?: {
    id: string;
    userId: string;
    grade: number;
    board: string;
  };

  @ApiProperty({ description: 'Quiz answers', required: false })
  answers?: any[];
}