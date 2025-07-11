import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse, CreateUserDto } from './interfaces/user.interface';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.create({
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      this.logger.error('Error creating user:', error);
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }
}
