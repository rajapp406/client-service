import { ConflictException, Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { 
  UserResponse, 
  CreateUserDto
} from './interfaces/user.interface';
import { 
  UserProfileDto, 
  CreateOrUpdateUserProfileDto 
} from './interfaces/profile.interface';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private prisma: PrismaService) {}

  // WARNING: This service stores passwords in plain text for development/testing purposes only.
  // In a production environment, always use proper password hashing (e.g., bcrypt).

  async createOrUpdateUserProfile(
    userId: string,
    profileData: CreateOrUpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    console.log(userId, profileData, 'userId, profileData');
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new RpcException({
          code: 5, // NOT_FOUND
          message: 'User not found',
        });
      }

      // Create or update the user profile
      const profile = await this.prisma.userProfile.upsert({
        where: { userId },
        update: {
          age: profileData.age,
          gender: profileData.gender,
          fitnessLevel: profileData.fitnessLevel,
          goals: profileData.goals,
          workoutFrequency: profileData.workoutFrequency,
          preferredWorkouts: profileData.preferredWorkouts,
        },
        create: {
          userId,
          age: profileData.age,
          gender: profileData.gender,
          fitnessLevel: profileData.fitnessLevel,
          goals: profileData.goals,
          workoutFrequency: profileData.workoutFrequency,
          preferredWorkouts: profileData.preferredWorkouts,
        },
        include: {
          user: true,
        },
      });

      // Convert to DTO
      return this.mapToUserProfileDto(profile);
    } catch (error) {
      this.logger.error(`Failed to update user profile: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    try {
      const profile = await this.prisma.userProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          age: true,
          gender: true,
          fitnessLevel: true,
          goals: true,
          workoutFrequency: true,
          preferredWorkouts: true,
        },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      return this.mapToUserProfileDto(profile);
    } catch (error) {
      this.logger.error(`Failed to get user profile: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Maps a Prisma UserProfile to a UserProfileDto
   * @param profile The Prisma UserProfile object
   * @returns A UserProfileDto object
   */
  mapToProfileDto(profile: any): UserProfileDto {
    return {
      id: profile.id,
      age: profile.age,
      gender: profile.gender,
      fitnessLevel: profile.fitnessLevel,
      goals: profile.goals,
      workoutFrequency: profile.workoutFrequency,
      preferredWorkouts: profile.preferredWorkouts,
    } as any;
  }

  /**
   * Alias for mapToProfileDto for gRPC compatibility
   */
  mapToUserProfileDto(profile: any): UserProfileDto {
    return this.mapToProfileDto(profile);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    try {
      // Check if user with this email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      
      // Create the user with plain text password
      // Password hashing is handled by the check service
      const user = await this.prisma.user.create({
        data: {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          password: createUserDto.password, // Stored as plain text
          isActive: createUserDto.isActive ?? true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          password: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      this.logger.log(`User created successfully: ${user.id}`);
      // Ensure all fields required by UserResponse are returned
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        email: user.email,
        isActive: user.isActive,
      };
    } catch (error) {
      this.logger.error('Error creating user:', error);
      // Check for Prisma unique constraint violation
      if ((error instanceof PrismaClientKnownRequestError || error?.name === 'PrismaClientKnownRequestError') && 
          error.code === 'P2002' && 
          error.meta?.target?.includes('email')) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async fetchUser(data: { email: string; password: string }): Promise<UserResponse> {
    try {
      // First, find the user by email
      console.log(data, 'data')
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          password: true, // We need the password for verification
          isActive: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with email ${data.email} not found`);
      }
console.log(user, 'user', data)
      // Password verification is handled by the check service


      // Remove password from the response
      const { password, ...userWithoutPassword } = user;
      
      // Return the user data without the password
      return {
        id: user.id,
        firstName: user.firstName,
        password: user.password,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
        profile: user.profile,
      };
    } catch (error) {
      this.logger.error(`Error fetching user ${data.email}:`, error);
      throw error;
    }
  }
  async fetchUserById(data: { id: string }): Promise<UserResponse> {
    try {
      // First, find the user by email
      console.log(data, 'data')
      const user = await this.prisma.user.findUnique({
        where: { id: data.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          password: true, // We need the password for verification
          isActive: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
            },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${data.id} not found`);
      }
console.log(user, 'user', data)
      // Password verification is handled by the check service


      // Remove password from the response
      const { password, ...userWithoutPassword } = user;
      
      // Return the user data without the password
      return {
        id: user.id,
        firstName: user.firstName,
        password: user.password,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
        profile: user.profile,
          };
    } catch (error) {
      this.logger.error(`Error fetching user ${data.id}:`, error);
      throw error;
    }
  }
}
