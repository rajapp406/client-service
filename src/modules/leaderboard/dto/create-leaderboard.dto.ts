import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class CreateLeaderboardDto {
  @ApiProperty({ 
    description: 'School ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsUUID()
  schoolId: string;

  @ApiProperty({ 
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    example: 1250, 
    description: 'Total score of the user',
    minimum: 0,
    maximum: 999999
  })
  @IsNumber()
  @Min(0)
  @Max(999999)
  totalScore: number;

  @ApiProperty({ 
    example: 1, 
    description: 'Rank of the user in the school',
    minimum: 1,
    maximum: 10000
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  rank: number;
}