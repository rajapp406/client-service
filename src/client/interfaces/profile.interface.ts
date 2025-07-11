import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { 
  IsArray, 
  IsDate, 
  IsInt, 
  IsNotEmpty, 
  IsString, 
  IsUUID, 
  Max, 
  Min, 
  ArrayMinSize 
} from 'class-validator';

@ApiExtraModels()
export class UserProfileDto {
  @ApiProperty({ description: 'The unique identifier of the user profile', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'The age of the user', example: 30 })
  @IsInt()
  @Min(13)
  @Max(120)
  age: number;

  @ApiProperty({ description: 'The gender of the user', example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ 
    description: 'The fitness level of the user', 
    example: 'Intermediate',
    enum: ['Beginner', 'Intermediate', 'Advanced']
  })
  @IsString()
  @IsNotEmpty()
  fitnessLevel: string;

  @ApiProperty({ 
    description: 'The fitness goals of the user', 
    example: ['Lose Weight', 'Build Muscle'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  goals: string[];

  @ApiProperty({ 
    description: 'How often the user works out', 
    example: '3-4 times per week'
  })
  @IsString()
  @IsNotEmpty()
  workoutFrequency: string;

  @ApiProperty({ 
    description: 'Preferred workout types', 
    example: ['Yoga', 'Weight Training'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  preferredWorkouts: string[];

  @ApiProperty({ description: 'When the profile was created' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'When the profile was last updated' })
  @IsDate()
  updatedAt: Date;
}

@ApiExtraModels()
export class CreateOrUpdateUserProfileDto {
  @ApiProperty({ description: 'The age of the user', example: 30 })
  @IsInt()
  @Min(13)
  @Max(120)
  age: number;

  @ApiProperty({ description: 'The gender of the user', example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ 
    description: 'The fitness level of the user', 
    example: 'Intermediate',
    enum: ['Beginner', 'Intermediate', 'Advanced']
  })
  @IsString()
  @IsNotEmpty()
  fitnessLevel: string;

  @ApiProperty({ 
    description: 'The fitness goals of the user', 
    example: ['Lose Weight', 'Build Muscle'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  goals: string[];

  @ApiProperty({ 
    description: 'How often the user works out', 
    example: '3-4 times per week'
  })
  @IsString()
  @IsNotEmpty()
  workoutFrequency: string;

  @ApiProperty({ 
    description: 'Preferred workout types', 
    example: ['Yoga', 'Weight Training'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  preferredWorkouts: string[];
}
