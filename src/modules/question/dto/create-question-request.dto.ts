import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsOptional } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuestionRequestDto {
  @ApiPropertyOptional({ 
    description: 'Array of questions to create',
    type: [CreateQuestionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[];

  /**
   * Helper method to get all questions as an array
   */
  getAllQuestions(): CreateQuestionDto[] {
    if (this.questions && this.questions.length > 0) {
      return this.questions;
    }
    return [];
  }
}
