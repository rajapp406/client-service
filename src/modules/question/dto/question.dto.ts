import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsUUID, 
  IsEnum, 
  IsInt, 
  IsOptional, 
  IsArray, 
  IsNotEmpty, 
  IsBoolean,
  IsDateString,
  IsJSON
} from 'class-validator';
import { 
  QuestionType, 
  Difficulty,
  Board,
} from '../../../../generated/prisma';

export class QuestionDto {
  @ApiProperty({
    description: 'Unique identifier of the question',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The question text',
    example: 'What is 2+2?'
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    description: 'Type of the question',
    enum: QuestionType,
    example: QuestionType.MCQ
  })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({
    description: 'Difficulty level of the question',
    enum: Difficulty,
    example: Difficulty.MEDIUM
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Array of possible answers',
    example: ['2', '3', '4', '5'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({
    description: 'The correct answer (must match one of the options exactly)',
    example: '4'
  })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @ApiPropertyOptional({
    description: 'Explanation for the correct answer',
    example: '2+2 equals 4',
    nullable: true
  })
  @IsString()
  @IsOptional()
  explanation?: string | null;

  @ApiProperty({
    description: 'Marks allocated for this question',
    example: 1,
    default: 1
  })
  @IsInt()
  marks: number;

  @ApiProperty({
    description: 'Whether the question is active',
    example: true,
    default: true
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Grade level for the question',
    example: 10
  })
  @IsInt()
  grade: number;

  @ApiProperty({
    description: 'Education board (e.g., CBSE, ICSE)',
    enum: Board,
    example: Board.CBSE
  })
  @IsString()
  board: Board;

  @ApiProperty({
    description: 'ID of the subject this question belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiPropertyOptional({
    description: 'ID of the chapter this question belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true
  })
  @IsString()
  @IsOptional()
  chapterId?: string | null;

  @ApiProperty({
    description: 'Date when the question was created',
    type: 'string',
    format: 'date-time'
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the question was last updated',
    type: 'string',
    format: 'date-time'
  })
  @IsDateString()
  updatedAt: Date;
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
    description: 'Options for the question in JSON string format',
    type: 'string',
    example: JSON.stringify(["2", "3", "4", "5"]),
    default: JSON.stringify(["Option 1", "Option 2", "Option 3"])
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
