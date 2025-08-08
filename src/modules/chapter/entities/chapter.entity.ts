import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Base interface for Chapter
interface IChapter {
  id: string;
  title: string;
  subjectId: string;
  chapterNumber: number | null;
  content: string | null;
  youtubeUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Base Chapter class with Swagger decorators
export class Chapter implements IChapter {
  @ApiProperty({ description: 'Unique identifier of the chapter' })
  id: string;

  @ApiProperty({ description: 'Title of the chapter' })
  title: string;

  @ApiProperty({ description: 'ID of the subject this chapter belongs to' })
  subjectId: string;

  @ApiPropertyOptional({ 
    description: 'Chapter number (used for ordering)',
    example: 1
  })
  chapterNumber: number | null;

  @ApiPropertyOptional({ 
    description: 'Detailed content of the chapter (can include HTML/markdown)',
    example: 'This chapter covers the basics of...'
  })
  content: string | null;

  @ApiPropertyOptional({
    description: 'YouTube URL for the chapter video',
    example: 'https://www.youtube.com/watch?v=example'
  })
  youtubeUrl: string | null;

  @ApiProperty({ description: 'Date when the chapter was created' })
  createdAt?: Date;

  @ApiProperty({ description: 'Date when the chapter was last updated' })
  updatedAt?: Date;

  constructor(partial: Partial<Chapter>) {
    Object.assign(this, partial);
  }
}

// Extended Chapter with relations
export class ChapterWithRelations extends Chapter {
  @ApiPropertyOptional({
    description: 'Subject details',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      grade: { type: 'number' },
      board: { type: 'string' },
    },
  })
  subject?: {
    id: string;
    name: string;
    grade: number;
    board: string;
  };

  @ApiProperty({
    description: 'Number of questions in this chapter',
    type: 'number',
    example: 5,
  })
  questionCount: number = 0;

  @ApiPropertyOptional({
    description: 'Count of related entities',
    type: 'object',
    properties: {
      questions: { type: 'number' },
    },
  })
  _count?: {
    questions: number;
  };

  constructor(partial: Partial<ChapterWithRelations>) {
    super(partial);
    Object.assign(this, partial);
  }
}
