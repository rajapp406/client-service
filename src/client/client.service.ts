import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse, CreateUserDto } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async createUser(data: CreateUserDto): Promise<UserResponse> {
    try {
      // Hash the password before storing it
      const hashedPassword = await this.hashPassword(data.password);
      
      const user = await this.prisma.user.create({
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          password: hashedPassword,
          isActive: data.isActive ?? true,
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

  async fetchUser(userId: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Ensure all fields required by UserResponse are returned
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      };
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }
}
