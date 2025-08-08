import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsNumber, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateChapterDto {
  @ApiProperty({ description: 'Title of the chapter' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'ID of the subject this chapter belongs to' })
  @IsUUID()
  subjectId: string;

  @ApiPropertyOptional({ 
    description: 'Chapter number (used for ordering)',
    example: 1
  })
  @IsNumber()
  @IsOptional()
  chapterNumber?: number;

  @ApiPropertyOptional({ 
    description: 'Detailed content of the chapter (can include HTML/markdown)',
    example: 'This chapter covers the basics of...'
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'YouTube URL for the chapter video',
    example: 'https://www.youtube.com/watch?v=example'
  })
  @IsUrl()
  @IsOptional()
  youtubeUrl?: string;

  @ApiPropertyOptional({
    description: 'Array of question IDs to associate with this chapter',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000']
  })
  @IsUUID(undefined, { each: true })
  @IsOptional()
  questionIds?: string[];
}
