import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize, IsString, IsUUID, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerSubmission {
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
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(3600)
  timeSpent?: number;
}

export class BulkSubmitAnswersDto {
  @ApiProperty({ 
    description: 'Array of answer submissions',
    type: [AnswerSubmission],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerSubmission)
  answers: AnswerSubmission[];
}