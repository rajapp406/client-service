import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClientService } from './client.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse } from './interfaces/user.interface';

describe('ClientService', () => {
  let service: ClientService;
  let prismaService: PrismaService;

  let mockUser: UserResponse;
  let mockPrismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    mockUser = {
      id: 'test-user-123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaService = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn().mockImplementation(({ data }) => 
          Promise.resolve({
            ...data,
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
      
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: createUserDto.id,
          name: createUserDto.name,
          email: createUserDto.email,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      });
      
      expect(result).toEqual(expect.objectContaining({
        id: createUserDto.id,
        name: createUserDto.name,
        email: createUserDto.email,
        isActive: true,
      }));
    });

    it('should throw ConflictException when email already exists', async () => {
      const prismaError = new Error('Email already exists');
      prismaError['code'] = 'P2002';
      
      // Mock the create method to throw a Prisma error
      mockPrismaService.user.create.mockRejectedValueOnce(prismaError);
      
      // Expect the service to convert Prisma error to ConflictException
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        new ConflictException('Email already exists')
      );
    });
  });

  describe('fetchUser', () => {
    it('should return a user with the provided userId', async () => {
      const result = await service.fetchUser(mockUser.id);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      });
      
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
      expect(result.isActive).toBe(mockUser.isActive);
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);
      
      await expect(service.fetchUser('non-existent-id')).rejects.toThrow(
        'User with ID non-existent-id not found',
      );
    });
  });
});
