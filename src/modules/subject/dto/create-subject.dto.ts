import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Board } from '../../../../generated/prisma';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathematics', description: 'Name of the subject' })
  @IsString()
  name: string;

  @ApiProperty({ example: 10, description: 'Grade level for the subject' })
  @IsNumber()
  grade: number;

  @ApiProperty({ 
    enum: Board, 
    example: Board.CBSE,
    description: 'Education board for the subject',
  })
  @IsEnum(Board)
  board: Board;

  @ApiPropertyOptional({ 
    example: 'https://example.com/math-icon.png', 
    description: 'URL to the subject icon',
    required: false 
  })
  @IsString()
  @IsOptional()
  iconUrl?: string;
}
