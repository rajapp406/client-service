import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  NotFoundException
} from '@nestjs/common';
import { 
  GrpcMethod,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { ClientService } from './client.service';
import { 
  UserResponse, 
  CreateUserDto
} from './interfaces/user.interface';
import {
  UserProfileDto,
  CreateOrUpdateUserProfileDto
} from './interfaces/profile.interface';

interface FetchUserRequest {
  email: string;
  password: string;
}

@ApiTags('users')
@Controller('users')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('profile/:userId')
  @ApiOperation({ 
    summary: 'Create or update user profile',
    description: 'Creates a new user profile or updates an existing one with the provided data.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID of the user to create/update profile for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The profile has been successfully created/updated.', 
    type: UserProfileDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found.' 
  })
  @ApiBody({ 
    type: CreateOrUpdateUserProfileDto,
    description: 'User profile data',
    examples: {
      basic: {
        summary: 'Basic profile',
        value: {
          age: 30,
          gender: 'Male',
          fitnessLevel: 'Intermediate',
          goals: ['Lose Weight', 'Build Muscle'],
          workoutFrequency: '3-4 times per week',
          preferredWorkouts: ['Yoga', 'Weight Training']
        }
      }
    }
  })
  async createOrUpdateProfile(
    @Param('userId') userId: string,
    @Body() profileData: CreateOrUpdateUserProfileDto
  ): Promise<UserProfileDto> {
    return this.clientService.createOrUpdateUserProfile(userId, profileData);
  }

  @Get('profile/:userId')
  @ApiOperation({ 
    summary: 'Get user profile by user ID',
    description: 'Retrieves the profile for the specified user ID.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID of the user whose profile to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the user profile', 
    type: UserProfileDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User or profile not found.' 
  })
  async getProfile(
    @Param('userId') userId: string
  ): Promise<UserProfileDto> {
    return this.clientService.getUserProfile(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'The user has been successfully found.', type: UserResponse })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.clientService.fetchUser({ email: id, password: '' });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The user has been successfully created.',
    type: UserResponse
  })
  @GrpcMethod('ClientService', 'createUser')
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.clientService.createUser(createUserDto);
  }

  // gRPC method (kept for backward compatibility)
  @GrpcMethod('ClientService', 'fetchUser')
  async fetchUserGrpc(@Payload() data: FetchUserRequest): Promise<UserResponse> {
    return this.clientService.fetchUser(data);
  }
}
