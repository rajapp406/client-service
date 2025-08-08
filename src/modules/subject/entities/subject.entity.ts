import { ApiProperty } from '@nestjs/swagger';
import { Board, Subject as PrismaSubject } from '../../../../generated/prisma';

interface ISubject {
  id: string;
  name: string;
  grade?: number;
  board: Board;
  description?: string | null;
  iconUrl?: string | null;
}
export class Subject implements ISubject {
  @ApiProperty({ description: 'Unique identifier of the subject' })
  id: string;

  @ApiProperty({ example: 'Mathematics', description: 'Name of the subject' })
  name: string;

  @ApiProperty({ example: 10, description: 'Grade level for the subject' })
  grade?: number;

  @ApiProperty({ 
    enum: Board, 
    example: Board.CBSE,
    description: 'Education board for the subject',
  })
  board: Board;

  @ApiProperty({ 
    example: 'Mathematics for grade 10', 
    description: 'Description of the subject',
    required: false 
  })
  description?: string | null;

  @ApiProperty({ 
    example: 'https://example.com/math-icon.png', 
    description: 'URL to the subject icon',
    required: false 
  })
  iconUrl?: string | null;

  @ApiProperty({ description: 'Date when the subject was created' })
  createdAt?: Date;

  @ApiProperty({ description: 'Date when the subject was last updated' })
  updatedAt?: Date;
}
