import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { OnboardingUserProfileDto } from './dto/onboarding-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserType, Board } from '../../../generated/prisma';

describe('UserProfileController', () => {
  let controller: UserProfileController;
  let service: UserProfileService;

  const mockUserProfileService = {
    create: jest.fn(),
    onboarding: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    updateByUserId: jest.fn(),
    remove: jest.fn(),
    removeByUserId: jest.fn(),
    searchProfiles: jest.fn(),
    addInterest: jest.fn(),
    removeInterest: jest.fn(),
    getProfileStatistics: jest.fn(),
  };

  const mockUserProfile = {
    id: '1',
    userId: 'user123',
    userType: UserType.STUDENT,
    schoolId: 'school-1',
    locationId: 'location-1',
    grade: 10,
    board: Board.CBSE,
    dateOfBirth: new Date('2000-01-01'),
    phoneNumber: '+1234567890',
    parentEmail: 'parent@example.com',
    parentPhone: '+1234567891',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProfileController],
      providers: [
        {
          provide: UserProfileService,
          useValue: mockUserProfileService,
        },
      ],
    }).compile();

    controller = module.get<UserProfileController>(UserProfileController);
    service = module.get<UserProfileService>(UserProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user profile', async () => {
      const createUserProfileDto: CreateUserProfileDto = {
        userId: 'user123',
        userType: UserType.STUDENT,
        locationId: 'location-1',
        schoolId: 'school-1',
        grade: 10,
        board: Board.CBSE,
      };

      mockUserProfileService.create.mockResolvedValue(mockUserProfile);

      const result = await controller.create(createUserProfileDto);

      expect(service.create).toHaveBeenCalledWith(createUserProfileDto);
      expect(result).toEqual(mockUserProfile);
    });
  });

  describe('onboarding', () => {
    it('should create profile through onboarding', async () => {
      const onboardingDto: OnboardingUserProfileDto = {
        userId: 'user123',
        userType: UserType.STUDENT,
        schoolId: 'school-1',
        grade: 10,
        board: Board.CBSE,
        interests: ['Mathematics', 'Science'],
      };

      const profileWithInterests = {
        ...mockUserProfile,
        interests: [
          { id: '1', interest: 'Mathematics' },
          { id: '2', interest: 'Science' },
        ],
      };

      mockUserProfileService.onboarding.mockResolvedValue(profileWithInterests);

      const result = await controller.onboarding(onboardingDto);

      expect(service.onboarding).toHaveBeenCalledWith(onboardingDto);
      expect(result).toEqual(profileWithInterests);
    });
  });

  describe('findAll', () => {
    it('should return all user profiles', async () => {
      const profiles = [mockUserProfile];
      mockUserProfileService.findAll.mockResolvedValue(profiles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({
        includeRelations: undefined,
        take: undefined,
        skip: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(profiles);
    });
  });

  describe('findByUserId', () => {
    it('should return profile by user ID', async () => {
      mockUserProfileService.findByUserId.mockResolvedValue(mockUserProfile);

      const result = await controller.findByUserId('user123');

      expect(service.findByUserId).toHaveBeenCalledWith('user123', undefined);
      expect(result).toEqual(mockUserProfile);
    });
  });

  describe('searchProfiles', () => {
    it('should search profiles with filters', async () => {
      const profiles = [mockUserProfile];
      mockUserProfileService.searchProfiles.mockResolvedValue(profiles);

      const result = await controller.searchProfiles(
        UserType.STUDENT,
        'school-1',
        'location-1',
        10,
        Board.CBSE,
        'user123',
      );

      expect(service.searchProfiles).toHaveBeenCalledWith({
        userType: UserType.STUDENT,
        schoolId: 'school-1',
        locationId: 'location-1',
        grade: 10,
        board: Board.CBSE,
        search: 'user123',
      });
      expect(result).toEqual(profiles);
    });
  });

  describe('update', () => {
    it('should update a user profile', async () => {
      const updateDto: UpdateUserProfileDto = {
        grade: 11,
        board: Board.ICSE,
      };

      const updatedProfile = { ...mockUserProfile, ...updateDto };
      mockUserProfileService.update.mockResolvedValue(updatedProfile);

      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('addInterest', () => {
    it('should add interest to profile', async () => {
      mockUserProfileService.addInterest.mockResolvedValue(undefined);

      await controller.addInterest('1', 'Mathematics');

      expect(service.addInterest).toHaveBeenCalledWith('1', 'Mathematics');
    });
  });

  describe('getStatistics', () => {
    it('should return profile statistics', async () => {
      const stats = {
        totalProfiles: 100,
        profilesByType: { [UserType.STUDENT]: 80, [UserType.TEACHER]: 20 },
        profilesByGrade: { 10: 30, 11: 25 },
      };

      mockUserProfileService.getProfileStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics();

      expect(service.getProfileStatistics).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });
});