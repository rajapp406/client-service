import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { UserProfileService } from "./user-profile.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserProfileDto } from "./dto/create-user-profile.dto";
import { OnboardingUserProfileDto } from "./dto/onboarding-user-profile.dto";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";
import { UserType, Board } from "../../../generated/prisma";

describe("UserProfileService", () => {
  let service: UserProfileService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    userProfile: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    location: {
      findUnique: jest.fn(),
    },
    school: {
      findUnique: jest.fn(),
    },
    userInterest: {
      createMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUserProfile = {
    id: "1",
    userId: "user123",
    userType: UserType.STUDENT,
    schoolId: "school-1",
    locationId: "location-1",
    grade: 10,
    board: Board.CBSE,
    dateOfBirth: new Date("2000-01-01"),
    phoneNumber: "+1234567890",
    parentEmail: "parent@example.com",
    parentPhone: "+1234567891",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLocation = {
    id: "location-1",
    city: "New York",
    state: "NY",
    country: "USA",
  };

  const mockSchool = {
    id: "school-1",
    name: "Test School",
    location: "New York",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    const createUserProfileDto: CreateUserProfileDto = {
      userId: "user123",
      userType: UserType.STUDENT,
      locationId: "location-1",
      schoolId: "school-1",
      grade: 10,
      board: Board.CBSE,
    };

    it("should create a user profile successfully", async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.school.findUnique.mockResolvedValue(mockSchool);
      mockPrismaService.userProfile.create.mockResolvedValue(mockUserProfile);

      const result = await service.create(createUserProfileDto);

      expect(mockPrismaService.userProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: createUserProfileDto.userId },
      });
      expect(mockPrismaService.location.findUnique).toHaveBeenCalledWith({
        where: { id: createUserProfileDto.locationId },
      });
      expect(mockPrismaService.school.findUnique).toHaveBeenCalledWith({
        where: { id: createUserProfileDto.schoolId },
      });
      expect(result).toEqual(mockUserProfile);
    });

    it("should throw ConflictException if profile already exists", async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(
        mockUserProfile
      );

      await expect(service.create(createUserProfileDto)).rejects.toThrow(
        ConflictException
      );
    });

    it("should throw NotFoundException if location not found", async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(service.create(createUserProfileDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw NotFoundException if school not found", async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.school.findUnique.mockResolvedValue(null);

      await expect(service.create(createUserProfileDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("onboarding", () => {
    const onboardingDto: OnboardingUserProfileDto = {
      userId: "user123",
      userType: UserType.STUDENT,
      schoolId: "school-1",
      grade: 10,
      board: Board.CBSE,
      interests: ["Mathematics", "Science"],
    };

    it("should create profile with interests successfully", async () => {
      const profileWithInterests = {
        ...mockUserProfile,
        interests: [
          { id: "1", interest: "Mathematics" },
          { id: "2", interest: "Science" },
        ],
      };

      mockPrismaService.userProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.school.findUnique.mockResolvedValue(mockSchool);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          userProfile: {
            create: jest.fn().mockResolvedValue(mockUserProfile),
            findUnique: jest.fn().mockResolvedValue(profileWithInterests),
          },
          userInterest: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        });
      });

      const result = await service.onboarding(onboardingDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(profileWithInterests);
    });
  });

  describe("findByUserId", () => {
    it("should return a profile by user ID", async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(
        mockUserProfile
      );

      const result = await service.findByUserId("user123");

      expect(mockPrismaService.userProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: "user123" },
        include: undefined,
      });
      expect(result).toEqual(mockUserProfile);
    });

    it("should throw NotFoundException if profile not found", async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(null);

      await expect(service.findByUserId("user123")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("addInterest", () => {
    it("should add interest successfully", async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(
        mockUserProfile
      );
      mockPrismaService.userInterest.findFirst.mockResolvedValue(null);
      mockPrismaService.userInterest.create.mockResolvedValue({
        id: "1",
        profileId: "1",
        interest: "Mathematics",
      });

      await service.addInterest("1", "Mathematics");

      expect(mockPrismaService.userInterest.create).toHaveBeenCalledWith({
        data: {
          profileId: "1",
          interest: "Mathematics",
        },
      });
    });

    it("should throw ConflictException if interest already exists", async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(
        mockUserProfile
      );
      mockPrismaService.userInterest.findFirst.mockResolvedValue({
        id: "1",
        profileId: "1",
        interest: "Mathematics",
      });

      await expect(service.addInterest("1", "Mathematics")).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("getProfileStatistics", () => {
    it("should return profile statistics", async () => {
      mockPrismaService.userProfile.count.mockResolvedValue(100);
      mockPrismaService.userProfile.groupBy
        .mockResolvedValueOnce([
          { userType: UserType.STUDENT, _count: { userType: 80 } },
          { userType: UserType.TEACHER, _count: { userType: 20 } },
        ])
        .mockResolvedValueOnce([
          { grade: 10, _count: { grade: 30 } },
          { grade: 11, _count: { grade: 25 } },
        ]);

      const result = await service.getProfileStatistics();

      expect(result).toEqual({
        totalProfiles: 100,
        profilesByType: {
          [UserType.STUDENT]: 80,
          [UserType.TEACHER]: 20,
        },
        profilesByGrade: {
          10: 30,
          11: 25,
        },
      });
    });
  });
});
