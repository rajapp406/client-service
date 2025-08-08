import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Board, Difficulty, QuestionType } from '../../../../generated/prisma';

export class CreateQuestionDto {
  @ApiProperty({ 
    description: 'The question text', 
    example: 'What is 2+2?',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    description: 'Type of the question',
    enum: QuestionType,
    example: QuestionType.MCQ,
    required: true
  })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({
    description: 'Difficulty level of the question',
    enum: Difficulty,
    example: Difficulty.MEDIUM,
    required: true
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Array of answer options',
    example: [
      {
        text: '25',
        isCorrect: true,
        explanation: 'The sum of the first n odd numbers is n². So 5² = 25.'
      },
      {
        text: '16',
        isCorrect: false,
        explanation: 'This is 4 squared, not the sum of first 5 odd numbers.'
      }
    ],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        isCorrect: { type: 'boolean' },
        explanation: { type: 'string' }
      },
      required: ['text', 'isCorrect']
    },
    required: true
  })
  @IsArray()
  @IsNotEmpty()
  options: Array<{
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }>;

  @ApiProperty({ 
    description: 'Explanation for the answer', 
    required: false,
    example: '2+2 equals 4 because...'
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({ 
    description: 'Marks for this question',
    example: 1,
    default: 1
  })
  @IsNumber()
  @IsOptional()
  marks?: number = 1;

  @ApiProperty({ 
    description: 'ID of the subject this question belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: true,
    type: 'string',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ 
    description: 'ID of the chapter this question belongs to (optional)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: 'string',
    format: 'uuid'
  })
  @IsUUID()
  @IsOptional()
  chapterId?: string;

  @ApiProperty({ 
    description: 'Whether the question is active',
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({ 
    description: 'Grade level for the question',
    example: 10,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  grade: number;

  @ApiProperty({ 
    description: 'Education board for the question',
    enum: Board,
    example: 'CBSE',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  board: Board;
}
