import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsUUID, 
  IsEnum, 
  IsInt, 
  IsOptional, 
  IsArray, 
  IsNotEmpty, 
  IsJSON
} from 'class-validator';
import { 
  QuestionType, 
  Difficulty,
  Board,
} from '../../../../generated/prisma';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'ID of the chapter this question belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  chapterId: string;

  @ApiProperty({
    description: 'ID of the subject this question belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({
    description: 'Grade level for this question',
    example: 10
  })
  @IsInt()
  @IsNotEmpty()
  grade: number;

  @ApiProperty({
    description: 'Education board this question belongs to (e.g., CBSE, ICSE)',
    example: 'CBSE'
  })
  @IsString()
  @IsNotEmpty()
  board: Board;

  @ApiProperty({
    enum: QuestionType,
    example: QuestionType.MCQ,
    description: 'Type of the question'
  })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  questionType: QuestionType;

  @ApiProperty({
    example: 'What is 2+2?',
    description: 'The question text'
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    description: 'Options for the question in JSON format',
    example: '["2", "3", "4", "5"]',
    type: 'string'
  })
  @IsJSON()
  @IsNotEmpty()
  options: string;

  @ApiProperty({
    description: 'The correct answer',
    example: '4'
  })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @ApiPropertyOptional({
    example: 'Detailed explanation of the answer',
    description: 'Explanation for the correct answer'
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({
    enum: Difficulty,
    default: Difficulty.MEDIUM,
    description: 'Difficulty level of the question'
  })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({
    description: 'ID of the chapter this question belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  chapterId?: string;

  @ApiPropertyOptional({
    description: 'ID of the subject this question belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Grade level for this question',
    example: 10
  })
  @IsInt()
  @IsOptional()
  grade?: number;

  @ApiPropertyOptional({
    description: 'Education board this question belongs to (e.g., CBSE, ICSE)',
    example: 'CBSE'
  })
  @IsString()
  @IsOptional()
  board?: Board;

  @ApiPropertyOptional({
    enum: QuestionType,
    description: 'Type of the question'
  })
  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @ApiPropertyOptional({
    example: 'What is 2+2?',
    description: 'The question text'
  })
  @IsString()
  @IsOptional()
  questionText?: string;

  @ApiPropertyOptional({
    description: 'Options for the question in JSON format',
    example: '["2", "3", "4", "5"]',
    type: 'string'
  })
  @IsJSON()
  @IsOptional()
  options?: string;

  @ApiPropertyOptional({
    description: 'The correct answer',
    example: '4'
  })
  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @ApiPropertyOptional({
    description: 'Explanation for the correct answer',
    example: 'The sum of 2 and 2 is 4.'
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({
    enum: Difficulty,
    description: 'Difficulty level of the question',
    example: Difficulty.MEDIUM
  })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;


}
