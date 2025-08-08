import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Board } from '../../../../generated/prisma';

export class UpdateSubjectDto {
  @ApiProperty({ example: 'Advanced Mathematics', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 11, required: false })
  @IsNumber()
  @IsOptional()
  grade?: number;

  @ApiProperty({ 
    enum: Board, 
    enumName: 'Board',
    example: Board.CBSE,
    required: false,
    description: 'Education board for the subject'
  })
  @IsEnum(Board)
  @IsOptional()
  board?: Board;

  @ApiProperty({ 
    example: 'https://example.com/math-icon.png', 
    description: 'URL to the subject icon',
    required: false 
  })
  @IsString()
  @IsOptional()
  iconUrl?: string;
}
