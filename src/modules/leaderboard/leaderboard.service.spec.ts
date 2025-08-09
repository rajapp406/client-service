import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    leaderboard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    school: {
      findUnique: jest.fn(),
    },
  };

  const mockLeaderboard = {
    id: '1',
    schoolId: 'school-1',
    userId: 'user-1',
    totalScore: 1250,
    rank: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSchool = {
    id: 'school-1',
    name: 'Test School',
    location: 'Test Location',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createLeaderboardDto: CreateLeaderboardDto = {
      schoolId: 'school-1',
      userId: 'user-1',
      totalScore: 1250,
      rank: 1,
    };

    it('should create a leaderboard entry successfully', async () => {
      mockPrismaService.leaderboard.findFirst.mockResolvedValue(null);
      mockPrismaService.school.findUnique.mockResolvedValue(mockSchool);
      mockPrismaService.leaderboard.create.mockResolvedValue(mockLeaderboard);

      const result = await service.create(createLeaderboardDto);

      expect(mockPrismaService.leaderboard.findFirst).toHaveBeenCalledWith({
        where: {
          schoolId: createLeaderboardDto.schoolId,
          userId: createLeaderboardDto.userId,
        },
      });
      expect(mockPrismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: createLeaderboardDto.schoolId },
      });
      expect(mockPrismaService.leaderboard.create).toHaveBeenCalledWith({
        data: createLeaderboardDto,
      });
      expect(result).toEqual(mockLeaderboard);
    });

    it('should throw ConflictException if entry already exists', async () => {
      mockPrismaService.leaderboard.findFirst.mockResolvedValue(mockLeaderboard);

      await expect(service.create(createLeaderboardDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.leaderboard.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.leaderboard.findFirst.mockResolvedValue(null);
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.create(createLeaderboardDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.leaderboard.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all leaderboard entries', async () => {
      const leaderboards = [mockLeaderboard];
      mockPrismaService.leaderboard.findMany.mockResolvedValue(leaderboards);

      const result = await service.findAll({});

      expect(mockPrismaService.leaderboard.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        cursor: undefined,
        where: undefined,
        orderBy: undefined,
        include: undefined,
      });
      expect(result).toEqual(leaderboards);
    });
  });

  describe('findOne', () => {
    it('should return a leaderboard entry by id', async () => {
      mockPrismaService.leaderboard.findUnique.mockResolvedValue(mockLeaderboard);

      const result = await service.findOne('1');

      expect(mockPrismaService.leaderboard.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: undefined,
      });
      expect(result).toEqual(mockLeaderboard);
    });

    it('should throw NotFoundException if entry not found', async () => {
      mockPrismaService.leaderboard.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLeaderboardBySchool', () => {
    it('should return leaderboard entries for a school', async () => {
      const leaderboards = [mockLeaderboard];
      mockPrismaService.school.findUnique.mockResolvedValue(mockSchool);
      mockPrismaService.leaderboard.findMany.mockResolvedValue(leaderboards);

      const result = await service.getLeaderboardBySchool('school-1');

      expect(mockPrismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: 'school-1' },
      });
      expect(mockPrismaService.leaderboard.findMany).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
        orderBy: { rank: 'asc' },
        take: 10,
        include: undefined,
      });
      expect(result).toEqual(leaderboards);
    });

    it('should throw NotFoundException if school not found', async () => {
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.getLeaderboardBySchool('school-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserRankings', () => {
    it('should update user rankings for a school', async () => {
      const entries = [
        { id: '1', totalScore: 1500, rank: 2 },
        { id: '2', totalScore: 1250, rank: 1 },
      ];
      mockPrismaService.leaderboard.findMany.mockResolvedValue(entries);
      mockPrismaService.leaderboard.update.mockResolvedValue({});

      await service.updateUserRankings('school-1');

      expect(mockPrismaService.leaderboard.findMany).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
        orderBy: { totalScore: 'desc' },
      });
      expect(mockPrismaService.leaderboard.update).toHaveBeenCalledTimes(2);
    });
  });
});