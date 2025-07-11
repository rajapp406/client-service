import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserResponse {
  @ApiProperty({ description: 'The unique identifier of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'The full name of the user', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The email address of the user', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Whether the user account is active', default: true, example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'The date and time when the user was created', type: Date })
  createdAt: Date;

  @ApiProperty({ description: 'The date and time when the user was last updated', type: Date })
  updatedAt: Date;
}

export class CreateUserDto {
  @ApiProperty({ description: 'The unique identifier for the new user', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'The full name of the user', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The email address of the user', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Whether the user account is active', 
    required: false, 
    default: true,
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
