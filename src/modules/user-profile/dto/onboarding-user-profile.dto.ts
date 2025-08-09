import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsUUID, 
  IsNumber, 
  IsEmail, 
  IsPhoneNumber, 
  IsDateString,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
  Max,
  MinLength,
  MaxLength
} from 'class-validator';
import { UserType, Board } from '../../../../generated/prisma';

export class OnboardingUserProfileDto {
  @ApiProperty({ 
    description: 'External user ID from user service',
    example: 'user123'
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  userId: string;

  @ApiProperty({ 
    enum: UserType,
    example: UserType.STUDENT,
    description: 'Type of user (STUDENT, TEACHER, PARENT, ADMIN)'
  })
  @IsEnum(UserType)
  userType: UserType;

  @ApiPropertyOptional({ 
    description: 'School ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  schoolId?: string;

  @ApiPropertyOptional({ 
    description: 'School Branch ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174111'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  schoolBranchId?: string;

  @ApiPropertyOptional({ 
    description: 'City ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174222'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ 
    example: 10, 
    description: 'Grade level (1-12)',
    minimum: 1,
    maximum: 12
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  grade?: number;

  @ApiPropertyOptional({ 
    enum: Board,
    example: Board.CBSE,
    description: 'Education board'
  })
  @IsOptional()
  @IsEnum(Board)
  board?: Board;

  @ApiPropertyOptional({ 
    description: 'Date of birth (ISO 8601 format)',
    example: '2000-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ 
    example: '+1234567890',
    description: 'Phone number'
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('IN')
  phoneNumber?: string;

  @ApiPropertyOptional({ 
    example: 'parent@example.com',
    description: 'Parent email address'
  })
  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @ApiPropertyOptional({ 
    example: '+1234567890',
    description: 'Parent phone number'
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('IN')
  parentPhone?: string;

  @ApiPropertyOptional({ 
    description: 'List of user interests',
    example: ['Mathematics', 'Science', 'Sports'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(50, { each: true })
  interests?: string[];
}