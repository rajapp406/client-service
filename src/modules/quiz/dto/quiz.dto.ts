import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuizType, Board } from '../../../../generated/prisma';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedQuizResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' }, description: 'Array of quizzes' })
  data: any[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  pagination: PaginationMetaDto;
}

export class CreateQuizDto {
  @ApiProperty({ description: 'The title of the quiz' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: QuizType, description: 'The type of the quiz' })
  @IsEnum(QuizType)
  type: QuizType;

  @ApiProperty({ description: 'The grade level for the quiz' })
  @IsNotEmpty()
  grade: number;

  @ApiPropertyOptional({ 
    enum: Board, 
    enumName: 'Board',
    example: Board.CBSE,
    description: 'Education board for the quiz (e.g., CBSE, ICSE)',
    required: false
  })
  @IsEnum(Board)
  @IsOptional()
  board?: Board;

  @ApiPropertyOptional({ description: 'The ID of the subject this quiz belongs to' })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Time limit for the quiz in minutes' })
  @IsOptional()
  timeLimit?: number;

  /**
   * List of question IDs to associate with this quiz.
   * This is NOT a direct DB field, but will be used to populate the join table QuizToQuestion.
   */
  @ApiPropertyOptional({ 
    type: [String], 
    description: 'Array of question IDs for the quiz',
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  questionIds?: string[];

  @ApiPropertyOptional({ 
    description: 'ID of the user creating the quiz',
    required: false
  })
  @IsString()
  @IsOptional()
  createdById?: string;
}

export class UpdateQuizDto {
  @ApiPropertyOptional({ description: 'The title of the quiz' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ enum: QuizType, description: 'The type of the quiz' })
  @IsEnum(QuizType)
  @IsOptional()
  type?: QuizType;

  @ApiPropertyOptional({ description: 'The grade level for the quiz' })
  @IsOptional()
  grade?: number;

  @ApiPropertyOptional({ 
    enum: Board, 
    enumName: 'Board',
    example: Board.CBSE,
    description: 'Education board for the quiz (e.g., CBSE, ICSE)',
    required: false
  })
  @IsEnum(Board)
  @IsOptional()
  board?: Board;

  @ApiPropertyOptional({ description: 'The ID of the subject this quiz belongs to' })
  @IsUUID()
  @IsOptional()
  subjectId?: string | null;

  @ApiPropertyOptional({ description: 'Time limit for the quiz in minutes' })
  @IsOptional()
  timeLimit?: number | null;

  /**
   * List of question IDs to associate with this quiz (for update).
   * This is NOT a direct DB field, but will be used to update the join table QuizToQuestion.
   */
  @ApiPropertyOptional({ type: [String], description: 'Array of question IDs for the quiz' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  questionIds?: string[];
}

export class QuizResponseDto {
  @ApiProperty({ description: 'The unique identifier of the quiz' })
  id: string;

  @ApiProperty({ description: 'The title of the quiz' })
  title: string;

  @ApiProperty({ enum: QuizType, description: 'The type of the quiz' })
  type: QuizType;

  @ApiProperty({ description: 'The grade level for the quiz' })
  grade: number;

  @ApiPropertyOptional({ description: 'The ID of the subject this quiz belongs to' })
  subjectId: string | null;

  @ApiPropertyOptional({ description: 'Time limit for the quiz in minutes' })
  timeLimit: number | null;

  /**
   * List of question IDs associated with this quiz (from join table).
   */
  @ApiProperty({ type: [String], description: 'Array of question IDs for the quiz (from join table)' })
  questionIds: string[];

  @ApiProperty({ description: 'ID of the user who created the quiz' })
  createdById: string;

  @ApiProperty({ description: 'Timestamp when the quiz was created' })
  createdAt: Date;
}
