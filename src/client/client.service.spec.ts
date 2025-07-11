import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClientService } from './client.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
}));

describe('ClientService', () => {
  let service: ClientService;
  let prismaService: PrismaService;

  let mockUser: UserResponse & { createdAt: Date; updatedAt: Date };
  let mockPrismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    const now = new Date();
    mockUser = {
      id: 'test-user-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };



    mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn().mockImplementation(({ data }) => 
          Promise.resolve({
            ...data,
            password: 'hashedPassword123',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        ),
      },
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    let createUserDto;
    
    beforeEach(() => {
      createUserDto = {
        id: 'new-user-123',
        name: 'New User',
        email: 'new.user@example.com',
        password: 'TestPassword123!',
        isActive: true,
      };
      
      // Reset the mock implementation for create to return the new user
      mockPrismaService.user.create.mockImplementation(({ data }) => 
        Promise.resolve({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
    });

    it('should create a new user', async () => {
      const result = await service.createUser(createUserDto);
      
      // Verify password was hashed
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: createUserDto.id,
          name: createUserDto.name,
          email: createUserDto.email,
          password: 'hashedPassword123',
          isActive: true,
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
      
      // The service returns a UserResponse which doesn't include timestamps
      expect(result).toEqual({
        id: createUserDto.id,
        name: createUserDto.name,
        email: createUserDto.email,
        isActive: true,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      // Create a plain object that matches the Prisma error structure
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed on the fields: (email)',
      };
      
      // Mock the create method to reject with the Prisma error
      mockPrismaService.user.create.mockRejectedValueOnce(prismaError);

      // The service should convert this to a ConflictException
      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
      
      // Verify the password was hashed before the error occurred
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });
  });

  describe('fetchUser', () => {
    it('should return a user if found', async () => {
      const result = await service.fetchUser({email: 'test-user-123', password: 'test-password-123'});
      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        isActive: mockUser.isActive,
      }));
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-123' },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);
      
      await expect(service.fetchUser({email: 'non-existent-id', password: ''})).rejects.toThrow(
        'User with ID non-existent-id not found',
      );
    });
  });
});
