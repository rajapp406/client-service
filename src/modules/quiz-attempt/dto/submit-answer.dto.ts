import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ 
    description: 'Quiz attempt ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsUUID()
  quizAttemptId: string;

  @ApiProperty({ 
    description: 'Question ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsString()
  @IsUUID()
  questionId: string;

  @ApiProperty({ 
    description: 'Selected option for MCQ/TRUE_FALSE questions',
    example: 'A',
    required: false
  })
  @IsOptional()
  @IsString()
  selectedOption?: string;

  @ApiProperty({ 
    description: 'Text answer for FILL_BLANK questions',
    example: 'The answer is 42',
    required: false
  })
  @IsOptional()
  @IsString()
  textAnswer?: string;

  @ApiProperty({ 
    description: 'Time spent on this question in seconds',
    example: 30,
    minimum: 0,
    maximum: 3600,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(3600)
  timeSpent?: number;
}