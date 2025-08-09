import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

describe('LeaderboardController', () => {
  let controller: LeaderboardController;
  let service: LeaderboardService;

  const mockLeaderboardService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getLeaderboardBySchool: jest.fn(),
    getLeaderboardByUser: jest.fn(),
    updateUserRankings: jest.fn(),
    getTopPerformers: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        {
          provide: LeaderboardService,
          useValue: mockLeaderboardService,
        },
      ],
    }).compile();

    controller = module.get<LeaderboardController>(LeaderboardController);
    service = module.get<LeaderboardService>(LeaderboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a leaderboard entry', async () => {
      const createLeaderboardDto: CreateLeaderboardDto = {
        schoolId: 'school-1',
        userId: 'user-1',
        totalScore: 1250,
        rank: 1,
      };

      mockLeaderboardService.create.mockResolvedValue(mockLeaderboard);

      const result = await controller.create(createLeaderboardDto);

      expect(service.create).toHaveBeenCalledWith(createLeaderboardDto);
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe('findAll', () => {
    it('should return all leaderboard entries', async () => {
      const leaderboards = [mockLeaderboard];
      mockLeaderboardService.findAll.mockResolvedValue(leaderboards);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({
        includeSchool: undefined,
        take: undefined,
        orderBy: { rank: 'asc' },
      });
      expect(result).toEqual(leaderboards);
    });
  });

  describe('getLeaderboardBySchool', () => {
    it('should return leaderboard entries for a school', async () => {
      const leaderboards = [mockLeaderboard];
      mockLeaderboardService.getLeaderboardBySchool.mockResolvedValue(leaderboards);

      const result = await controller.getLeaderboardBySchool('school-1');

      expect(service.getLeaderboardBySchool).toHaveBeenCalledWith('school-1', {
        limit: undefined,
        includeSchool: undefined,
      });
      expect(result).toEqual(leaderboards);
    });
  });

  describe('getTopPerformers', () => {
    it('should return top performers', async () => {
      const topPerformers = [mockLeaderboard];
      mockLeaderboardService.getTopPerformers.mockResolvedValue(topPerformers);

      const result = await controller.getTopPerformers();

      expect(service.getTopPerformers).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(topPerformers);
    });
  });

  describe('updateUserRankings', () => {
    it('should update user rankings for a school', async () => {
      mockLeaderboardService.updateUserRankings.mockResolvedValue(undefined);

      await controller.updateUserRankings('school-1');

      expect(service.updateUserRankings).toHaveBeenCalledWith('school-1');
    });
  });
});