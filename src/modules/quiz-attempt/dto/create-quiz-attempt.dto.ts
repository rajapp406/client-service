import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { AttemptStatus } from '../../../../generated/prisma';

export class CreateQuizAttemptDto {
  @ApiProperty({ 
    description: 'Quiz ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsUUID()
  quizId: string;

  @ApiProperty({ 
    description: 'Student ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsString()
  @IsUUID()
  userProfileId: string;

  @ApiProperty({ 
    example: 1800, 
    description: 'Time spent on the quiz in seconds',
    required: false,
    minimum: 0,
    maximum: 86400 // 24 hours max
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(86400)
  timeSpent?: number;

  @ApiProperty({ 
    example: 85.5, 
    description: 'Percentage score (0-100)',
    required: false,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiProperty({ 
    example: 20, 
    description: 'Total number of questions in the quiz',
    required: false,
    minimum: 1,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  totalQuestions?: number;

  @ApiProperty({ 
    example: 17, 
    description: 'Number of correct answers',
    required: false,
    minimum: 0,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  correctAnswers?: number;

  @ApiProperty({ 
    example: 85, 
    description: 'Total points earned',
    required: false,
    minimum: 0,
    maximum: 100000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  totalPoints?: number;

  @ApiProperty({ 
    example: 100, 
    description: 'Maximum possible points',
    required: false,
    minimum: 1,
    maximum: 100000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  maxPoints?: number;

  @ApiProperty({ 
    enum: AttemptStatus,
    example: AttemptStatus.IN_PROGRESS,
    description: 'Current status of the quiz attempt',
    required: false
  })
  @IsOptional()
  @IsEnum(AttemptStatus)
  status?: AttemptStatus;
}