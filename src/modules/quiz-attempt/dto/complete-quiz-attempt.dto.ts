import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CompleteQuizAttemptDto {
  @ApiProperty({ 
    example: 1800, 
    description: 'Time spent on the quiz in seconds',
    minimum: 0,
    maximum: 86400 // 24 hours max
  })
  @IsNumber()
  @Min(0)
  @Max(86400)
  timeSpent: number;

  @ApiProperty({ 
    example: 85.5, 
    description: 'Percentage score (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ 
    example: 20, 
    description: 'Total number of questions in the quiz',
    minimum: 1,
    maximum: 1000
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  totalQuestions: number;

  @ApiProperty({ 
    example: 17, 
    description: 'Number of correct answers',
    minimum: 0,
    maximum: 1000
  })
  @IsNumber()
  @Min(0)
  @Max(1000)
  correctAnswers: number;

  @ApiProperty({ 
    example: 85, 
    description: 'Total points earned',
    minimum: 0,
    maximum: 100000
  })
  @IsNumber()
  @Min(0)
  @Max(100000)
  totalPoints: number;

  @ApiProperty({ 
    example: 100, 
    description: 'Maximum possible points',
    minimum: 1,
    maximum: 100000
  })
  @IsNumber()
  @Min(1)
  @Max(100000)
  maxPoints: number;
}