import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfile as PrismaUserProfile, UserType, Board } from '../../../../generated/prisma';

interface IUserProfile {
  id: string;
  userId: string;
  userType: UserType;
  schoolId?: string | null;
  grade?: number | null;
  board?: Board | null;
  dateOfBirth?: Date | null;
  phoneNumber?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
}

export class UserProfile implements IUserProfile {
  @ApiProperty({ description: 'Unique identifier of the user profile' })
  id: string;

  @ApiProperty({ description: 'External user ID from user service' })
  userId: string;

  @ApiProperty({ 
    enum: UserType,
    example: UserType.STUDENT,
    description: 'Type of user (STUDENT, TEACHER, PARENT, ADMIN)'
  })
  userType: UserType;

  @ApiPropertyOptional({ 
    description: 'School ID (optional)',
    nullable: true
  })
  schoolId?: string | null;


  @ApiPropertyOptional({ 
    example: 10, 
    description: 'Grade level (optional for students)',
    nullable: true
  })
  grade?: number | null;

  @ApiPropertyOptional({ 
    enum: Board,
    example: Board.CBSE,
    description: 'Education board (optional)',
    nullable: true
  })
  board?: Board | null;

  @ApiPropertyOptional({ 
    description: 'Date of birth',
    type: 'string',
    format: 'date-time',
    nullable: true
  })
  dateOfBirth?: Date | null;

  @ApiPropertyOptional({ 
    example: '+1234567890',
    description: 'Phone number',
    nullable: true
  })
  phoneNumber?: string | null;

  @ApiPropertyOptional({ 
    example: 'parent@example.com',
    description: 'Parent email address',
    nullable: true
  })
  parentEmail?: string | null;

  @ApiPropertyOptional({ 
    example: '+1234567890',
    description: 'Parent phone number',
    nullable: true
  })
  parentPhone?: string | null;

  @ApiProperty({ description: 'Date when the profile was created' })
  createdAt?: Date;

  @ApiProperty({ description: 'Date when the profile was last updated' })
  updatedAt?: Date;

  // Optional populated relations
  @ApiPropertyOptional({ description: 'School information', required: false })
  school?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ description: 'Location information', required: false })
  location?: {
    id: string;
    cityId: string;
    city?: {
      id: string;
      name: string;
      country: {
        id: string;
        name: string;
        code: string;
      };
      State?: {
        id: string;
        name: string;
        countryId: string;
      };
    };
  };

  @ApiPropertyOptional({ description: 'User interests', required: false })
  interests?: Array<{
    id: string;
    interest: string;
  }>;
}