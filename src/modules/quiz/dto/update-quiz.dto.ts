import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { CreateQuizDto } from './quiz.dto';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @ApiPropertyOptional({ 
    example: 'Updated Mathematics Quiz', 
    description: 'Title of the quiz'
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ 
    example: 15, 
    description: 'Total number of questions in the quiz'
  })
  @IsInt()
  @IsOptional()
  totalQuestions?: number;

  @ApiPropertyOptional({ 
    example: 150, 
    description: 'Total marks for the quiz'
  })
  @IsInt()
  @IsOptional()
  totalMarks?: number;

  @ApiPropertyOptional({ 
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    description: 'Status of the quiz',
    enumName: 'ContentStatus'
  })
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const)
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @ApiPropertyOptional({
    example: { difficulty: 'medium', tags: ['algebra', 'geometry'] },
    description: 'Additional metadata (optional)'
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
