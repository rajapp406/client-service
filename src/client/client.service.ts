import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse, CreateUserDto } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private prisma: PrismaService) {}

  // WARNING: This service stores passwords in plain text for development/testing purposes only.
  // In a production environment, always use proper password hashing (e.g., bcrypt).

  async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    try {
      // Check if user with this email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      
      // Create the user with plain text password (NOT RECOMMENDED for production)
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: createUserDto.password, // Storing plain text password
          isActive: createUserDto.isActive ?? true,
        },
        select: {
          id: true,
          name: true,
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
        name: user.name,
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
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true, // We need the password for verification
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with email ${data.email} not found`);
      }
      // WARNING: Direct string comparison of plain text passwords
      // In a production environment, use bcrypt.compare() for hashed passwords
      if (user.password !== data.password) {
        throw new Error('Invalid credentials');
      }

      // Remove password from the response
      const { password, ...userWithoutPassword } = user;
      
      // Return the user data without the password
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      };
    } catch (error) {
      this.logger.error(`Error fetching user ${data.email}:`, error);
      throw error;
    }
  }
}
