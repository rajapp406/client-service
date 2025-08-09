import { ApiProperty } from '@nestjs/swagger';

export class QuizAnswer {
  @ApiProperty({ description: 'Unique identifier of the quiz answer' })
  id: string;

  @ApiProperty({ description: 'Quiz attempt ID (foreign key)' })
  quizAttemptId: string;

  @ApiProperty({ description: 'Question ID (foreign key)' })
  questionId: string;

  @ApiProperty({ 
    description: 'Selected option for MCQ/TRUE_FALSE questions',
    required: false,
    nullable: true
  })
  selectedOption?: string | null;

  @ApiProperty({ 
    description: 'Text answer for FILL_BLANK questions',
    required: false,
    nullable: true
  })
  textAnswer?: string | null;

  @ApiProperty({ 
    description: 'Whether the answer is correct',
    required: false,
    nullable: true
  })
  isCorrect?: boolean | null;

  @ApiProperty({ 
    description: 'Points earned for this answer',
    example: 1
  })
  pointsEarned: number;

  @ApiProperty({ 
    description: 'Time spent on this question in seconds',
    required: false,
    nullable: true
  })
  timeSpent?: number | null;

  @ApiProperty({ description: 'Date and time when the answer was submitted' })
  answeredAt: Date;

  // Optional populated relations
  @ApiProperty({ description: 'Question information', required: false })
  question?: {
    id: string;
    questionText: string;
    questionType: string;
    options: any;
    explanation?: string;
  };

  @ApiProperty({ description: 'Quiz attempt information', required: false })
  quizAttempt?: {
    id: string;
    quizId: string;
    studentId: string;
    status: string;
  };
}