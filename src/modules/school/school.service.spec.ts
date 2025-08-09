import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SchoolService } from './school.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

describe('SchoolService', () => {
  let service: SchoolService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    school: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSchool = {
    id: '1',
    name: 'Delhi Public School',
    locationId: '123e4567-e89b-12d3-a456-426614174000',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SchoolService>(SchoolService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createSchoolDto: CreateSchoolDto = {
      name: 'Delhi Public School',
      locationId: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should create a school successfully', async () => {
      mockPrismaService.school.findFirst.mockResolvedValue(null);
      mockPrismaService.school.create.mockResolvedValue(mockSchool);

      const result = await service.create(createSchoolDto);

      expect(mockPrismaService.school.findFirst).toHaveBeenCalledWith({
        where: {
          name: createSchoolDto.name,
          locationId: createSchoolDto.locationId,
        },
      });
      expect(mockPrismaService.school.create).toHaveBeenCalledWith({
        data: createSchoolDto,
      });
      expect(result).toEqual(mockSchool);
    });

    it('should throw ConflictException if school already exists', async () => {
      mockPrismaService.school.findFirst.mockResolvedValue(mockSchool);

      await expect(service.create(createSchoolDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.school.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all schools', async () => {
      const schools = [mockSchool];
      mockPrismaService.school.findMany.mockResolvedValue(schools);

      const result = await service.findAll({});

      expect(mockPrismaService.school.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        cursor: undefined,
        where: undefined,
        orderBy: undefined,
      });
      expect(result).toEqual(schools);
    });
  });

  describe('findOne', () => {
    it('should return a school by id', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(mockSchool);

      const result = await service.findOne('1');

      expect(mockPrismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockSchool);
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateSchoolDto: UpdateSchoolDto = {
      name: 'Updated School Name',
    };

    it('should update a school successfully', async () => {
      const updatedSchool = { ...mockSchool, ...updateSchoolDto };
      mockPrismaService.school.findUnique.mockResolvedValue(mockSchool);
      mockPrismaService.school.findFirst.mockResolvedValue(null);
      mockPrismaService.school.update.mockResolvedValue(updatedSchool);

      const result = await service.update('1', updateSchoolDto);

      expect(mockPrismaService.school.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateSchoolDto,
      });
      expect(result).toEqual(updatedSchool);
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateSchoolDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a school successfully', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(mockSchool);
      mockPrismaService.school.delete.mockResolvedValue(mockSchool);

      await service.remove('1');

      expect(mockPrismaService.school.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchSchools', () => {
    it('should search schools by name and location', async () => {
      const schools = [mockSchool];
      mockPrismaService.school.findMany.mockResolvedValue(schools);

      const result = await service.searchSchools({
        search: 'Delhi',
        location: 'New Delhi',
      });

      expect(mockPrismaService.school.findMany).toHaveBeenCalledWith({
        where: {
          location: { contains: 'New Delhi', mode: 'insensitive' },
          OR: [
            { name: { contains: 'Delhi', mode: 'insensitive' } },
            { location: { contains: 'Delhi', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(schools);
    });
  });

  describe('getSchoolWithLeaderboard', () => {
    it('should return school with leaderboard', async () => {
      const schoolWithLeaderboard = {
        ...mockSchool,
        leaderboards: [
          { id: '1', userId: 'user1', totalScore: 100, rank: 1 },
        ],
      };
      mockPrismaService.school.findUnique.mockResolvedValue(schoolWithLeaderboard);

      const result = await service.getSchoolWithLeaderboard('1');

      expect(mockPrismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          leaderboards: {
            orderBy: { rank: 'asc' },
            take: 10,
          },
        },
      });
      expect(result).toEqual(schoolWithLeaderboard);
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.getSchoolWithLeaderboard('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});