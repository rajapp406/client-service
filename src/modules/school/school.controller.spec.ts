import { Test, TestingModule } from '@nestjs/testing';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

describe('SchoolController', () => {
  let controller: SchoolController;
  let service: SchoolService;

  const mockSchoolService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    searchSchools: jest.fn(),
    getSchoolWithLeaderboard: jest.fn(),
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
      controllers: [SchoolController],
      providers: [
        {
          provide: SchoolService,
          useValue: mockSchoolService,
        },
      ],
    }).compile();

    controller = module.get<SchoolController>(SchoolController);
    service = module.get<SchoolService>(SchoolService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a school', async () => {
      const createSchoolDto: CreateSchoolDto = {
        name: 'Delhi Public School',
        locationId: '123e4567-e89b-12d3-a456-426614174000',
      };

      mockSchoolService.create.mockResolvedValue(mockSchool);

      const result = await controller.create(createSchoolDto);

      expect(service.create).toHaveBeenCalledWith(createSchoolDto);
      expect(result).toEqual(mockSchool);
    });
  });

  describe('findAll', () => {
    it('should return all schools when no query params', async () => {
      const schools = [mockSchool];
      mockSchoolService.findAll.mockResolvedValue(schools);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(schools);
    });

    it('should search schools when query params provided', async () => {
      const schools = [mockSchool];
      mockSchoolService.searchSchools.mockResolvedValue(schools);

      const result = await controller.findAll('Delhi', 'New Delhi');

      expect(service.searchSchools).toHaveBeenCalledWith({
        search: 'Delhi',
        location: 'New Delhi',
      });
      expect(result).toEqual(schools);
    });
  });

  describe('findOne', () => {
    it('should return a school by id', async () => {
      mockSchoolService.findOne.mockResolvedValue(mockSchool);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockSchool);
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
      mockSchoolService.getSchoolWithLeaderboard.mockResolvedValue(schoolWithLeaderboard);

      const result = await controller.getSchoolWithLeaderboard('1');

      expect(service.getSchoolWithLeaderboard).toHaveBeenCalledWith('1');
      expect(result).toEqual(schoolWithLeaderboard);
    });
  });

  describe('update', () => {
    it('should update a school', async () => {
      const updateSchoolDto: UpdateSchoolDto = {
        name: 'Updated School Name',
      };
      const updatedSchool = { ...mockSchool, ...updateSchoolDto };

      mockSchoolService.update.mockResolvedValue(updatedSchool);

      const result = await controller.update('1', updateSchoolDto);

      expect(service.update).toHaveBeenCalledWith('1', updateSchoolDto);
      expect(result).toEqual(updatedSchool);
    });
  });

  describe('remove', () => {
    it('should delete a school', async () => {
      mockSchoolService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});