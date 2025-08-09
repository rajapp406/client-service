import { ApiProperty } from '@nestjs/swagger';
import { Leaderboard as PrismaLeaderboard } from '../../../../generated/prisma';

interface ILeaderboard {
  id: string;
  schoolId: string;
  userId: string;
  totalScore: number;
  rank: number;
}

export class Leaderboard implements ILeaderboard {
  @ApiProperty({ description: 'Unique identifier of the leaderboard entry' })
  id: string;

  @ApiProperty({ description: 'School ID (foreign key)' })
  schoolId: string;

  @ApiProperty({ description: 'User ID (external foreign key)' })
  userId: string;

  @ApiProperty({ example: 1250, description: 'Total score of the user' })
  totalScore: number;

  @ApiProperty({ example: 1, description: 'Rank of the user in the school' })
  rank: number;

  @ApiProperty({ description: 'Date when the leaderboard entry was created' })
  createdAt?: Date;

  @ApiProperty({ description: 'Date when the leaderboard entry was last updated' })
  updatedAt?: Date;

  // Optional populated relations
  @ApiProperty({ description: 'School information', required: false })
  school?: {
    id: string;
    name: string;
  };
}