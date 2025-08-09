import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { OnboardingUserProfileDto } from './dto/onboarding-user-profile.dto';
import { UserProfile } from './entities/user-profile.entity';
import { Prisma, UserType } from '../../../generated/prisma';

@Injectable()
export class UserProfileService {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService,
  ) {}

  async create(createUserProfileDto: CreateUserProfileDto): Promise<UserProfile> {
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId: createUserProfileDto.userId },
    });

    if (existingProfile) {
      throw new ConflictException('User profile already exists for this user');
    }


    if (createUserProfileDto.schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: createUserProfileDto.schoolId } });
      if (!school) {
        throw new NotFoundException(`School with ID ${createUserProfileDto.schoolId} not found`);
      }
    }

    if (createUserProfileDto.schoolBranchId) {
      const branch = await this.prisma.schoolBranch.findUnique({ where: { id: createUserProfileDto.schoolBranchId } });
      if (!branch) {
        throw new NotFoundException(`SchoolBranch with ID ${createUserProfileDto.schoolBranchId} not found`);
      }
    }

    if (createUserProfileDto.cityId) {
      const city = await this.prisma.city.findUnique({ where: { id: createUserProfileDto.cityId } });
      if (!city) {
        throw new NotFoundException(`City with ID ${createUserProfileDto.cityId} not found`);
      }
    }

    const data: Prisma.UserProfileCreateInput = {
      userId: createUserProfileDto.userId,
      userType: createUserProfileDto.userType,
      school: createUserProfileDto.schoolId ? { connect: { id: createUserProfileDto.schoolId } } : undefined,
      location: { connect: { id: createUserProfileDto.locationId } },
      grade: createUserProfileDto.grade,
      board: createUserProfileDto.board,
      dateOfBirth: createUserProfileDto.dateOfBirth ? new Date(createUserProfileDto.dateOfBirth) : undefined,
      phoneNumber: createUserProfileDto.phoneNumber,
      parentEmail: createUserProfileDto.parentEmail,
      parentPhone: createUserProfileDto.parentPhone,
      SchoolBranch: createUserProfileDto.schoolBranchId ? { connect: { id: createUserProfileDto.schoolBranchId } } : undefined,
      City: createUserProfileDto.cityId ? { connect: { id: createUserProfileDto.cityId } } : undefined,
    } as any;

    return this.prisma.userProfile.create({ data }) as unknown as UserProfile;
  }

  async onboarding(onboardingDto: OnboardingUserProfileDto): Promise<UserProfile> {
    const existingProfile = await this.prisma.userProfile.findUnique({ where: { userId: onboardingDto.userId } });
    if (existingProfile) {
      throw new ConflictException('User profile already exists for this user');
    }

    if (onboardingDto.schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: onboardingDto.schoolId } });
      if (!school) {
        throw new NotFoundException(`School with ID ${onboardingDto.schoolId} not found`);
      }
    }

    let schoolBranchId: string | undefined;
    if (onboardingDto.schoolId && onboardingDto.cityId) {
      try {
        // First try to find an existing branch
        const existingBranch = await this.prisma.schoolBranch.findFirst({
          where: {
            schoolId: onboardingDto.schoolId,
            cityId: onboardingDto.cityId
          },
          select: { id: true }
        });

        if (existingBranch) {
          schoolBranchId = existingBranch.id;
        } else {
          // If not found, create a new one
          const newBranch = await this.prisma.schoolBranch.create({
            data: {
              school: { connect: { id: onboardingDto.schoolId } },
              city: { connect: { id: onboardingDto.cityId } }
            },
            select: { id: true }
          });
          schoolBranchId = newBranch.id;
        }
      } catch (error) {
        // If there's a race condition and another request created the branch, try to fetch it
        if (error.code === 'P2002') { // Unique constraint violation
          const existingBranch = await this.prisma.schoolBranch.findFirst({
            where: {
              schoolId: onboardingDto.schoolId,
              cityId: onboardingDto.cityId
            },
            select: { id: true }
          });
          if (existingBranch) {
            schoolBranchId = existingBranch.id;
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    if (onboardingDto.cityId) {
      const city = await this.prisma.city.findUnique({ where: { id: onboardingDto.cityId } });
      if (!city) {
        throw new NotFoundException(`City with ID ${onboardingDto.cityId} not found`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const profileData: Prisma.UserProfileCreateInput = {
        userId: onboardingDto.userId,
        userType: onboardingDto.userType,
        school: onboardingDto.schoolId ? { connect: { id: onboardingDto.schoolId } } : undefined,
        grade: onboardingDto.grade,
        board: onboardingDto.board,
        dateOfBirth: onboardingDto.dateOfBirth ? new Date(onboardingDto.dateOfBirth) : undefined,
        phoneNumber: onboardingDto.phoneNumber,
        parentEmail: onboardingDto.parentEmail,
        parentPhone: onboardingDto.parentPhone,
        SchoolBranch: schoolBranchId ? { connect: { id: schoolBranchId } } : undefined,
        City: onboardingDto.cityId ? { connect: { id: onboardingDto.cityId } } : undefined,
      } as any;

      const profile = await tx.userProfile.create({ data: profileData });

      if (onboardingDto.interests && onboardingDto.interests.length > 0) {
        await tx.userInterest.createMany({
          data: onboardingDto.interests.map(interest => ({ profileId: profile.id, interest })),
        });
      }

      return tx.userProfile.findUnique({
        where: { id: profile.id },
        include: {
          interests: true,
          school: true,
          SchoolBranch: true,
          City: true,
        },
      }) as unknown as UserProfile;
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserProfileWhereUniqueInput;
    where?: Prisma.UserProfileWhereInput;
    orderBy?: Prisma.UserProfileOrderByWithRelationInput;
    includeRelations?: boolean;
  }): Promise<UserProfile[]> {
    const { skip, take, cursor, where, orderBy, includeRelations } = params;
    return this.prisma.userProfile.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: includeRelations ? {
        school: true,
        interests: true,
        SchoolBranch: true,
        City: true,
      } : undefined,
    }) as unknown as UserProfile[];
  }

  async findOne(id: string, includeRelations = false): Promise<UserProfile | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id },
      include: includeRelations ? {
        school: true,
        interests: true,
        SchoolBranch: true,
        City: true,
      } : undefined,
    });

    if (!profile) {
      throw new NotFoundException(`User profile with ID ${id} not found`);
    }

    return profile as unknown as UserProfile;
  }

  async findByUserId(userId: string, includeRelations = false): Promise<UserProfile | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: includeRelations ? {
        school: true,
        interests: true,
        SchoolBranch: true,
        City: true,
      } : undefined,
    });

    if (!profile) {
      throw new NotFoundException(`User profile for user ID ${userId} not found`);
    }

    return profile as unknown as UserProfile;
  }

  async update(id: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    await this.findOne(id);

    if (updateUserProfileDto.locationId) {
      const location = await this.prisma.location.findUnique({ where: { id: updateUserProfileDto.locationId } });
      if (!location) {
        throw new NotFoundException(`Location with ID ${updateUserProfileDto.locationId} not found`);
      }
    }

    if (updateUserProfileDto.schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: updateUserProfileDto.schoolId } });
      if (!school) {
        throw new NotFoundException(`School with ID ${updateUserProfileDto.schoolId} not found`);
      }
    }

    if (updateUserProfileDto.schoolBranchId) {
      const branch = await this.prisma.schoolBranch.findUnique({ where: { id: updateUserProfileDto.schoolBranchId } });
      if (!branch) {
        throw new NotFoundException(`SchoolBranch with ID ${updateUserProfileDto.schoolBranchId} not found`);
      }
    }

    if (updateUserProfileDto.cityId) {
      const city = await this.prisma.city.findUnique({ where: { id: updateUserProfileDto.cityId } });
      if (!city) {
        throw new NotFoundException(`City with ID ${updateUserProfileDto.cityId} not found`);
      }
    }

    const data: Prisma.UserProfileUpdateInput = {
      userType: updateUserProfileDto.userType,
      school: updateUserProfileDto.schoolId ? { connect: { id: updateUserProfileDto.schoolId } } : undefined,
      location: updateUserProfileDto.locationId ? { connect: { id: updateUserProfileDto.locationId } } : undefined,
      grade: updateUserProfileDto.grade,
      board: updateUserProfileDto.board,
      dateOfBirth: updateUserProfileDto.dateOfBirth ? new Date(updateUserProfileDto.dateOfBirth) : undefined,
      phoneNumber: updateUserProfileDto.phoneNumber,
      parentEmail: updateUserProfileDto.parentEmail,
      parentPhone: updateUserProfileDto.parentPhone,
      SchoolBranch: updateUserProfileDto.schoolBranchId ? { connect: { id: updateUserProfileDto.schoolBranchId } } : undefined,
      City: updateUserProfileDto.cityId ? { connect: { id: updateUserProfileDto.cityId } } : undefined,
    } as any;

    return this.prisma.userProfile.update({ where: { id }, data }) as unknown as UserProfile;
  }

  async updateByUserId(userId: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    await this.findByUserId(userId);

    if (updateUserProfileDto.locationId) {
      const location = await this.prisma.location.findUnique({ where: { id: updateUserProfileDto.locationId } });
      if (!location) {
        throw new NotFoundException(`Location with ID ${updateUserProfileDto.locationId} not found`);
      }
    }

    if (updateUserProfileDto.schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: updateUserProfileDto.schoolId } });
      if (!school) {
        throw new NotFoundException(`School with ID ${updateUserProfileDto.schoolId} not found`);
      }
    }

    if (updateUserProfileDto.schoolBranchId) {
      const branch = await this.prisma.schoolBranch.findUnique({ where: { id: updateUserProfileDto.schoolBranchId } });
      if (!branch) {
        throw new NotFoundException(`SchoolBranch with ID ${updateUserProfileDto.schoolBranchId} not found`);
      }
    }

    if (updateUserProfileDto.cityId) {
      const city = await this.prisma.city.findUnique({ where: { id: updateUserProfileDto.cityId } });
      if (!city) {
        throw new NotFoundException(`City with ID ${updateUserProfileDto.cityId} not found`);
      }
    }

    const data: Prisma.UserProfileUpdateInput = {
      userType: updateUserProfileDto.userType,
      school: updateUserProfileDto.schoolId ? { connect: { id: updateUserProfileDto.schoolId } } : undefined,
      location: updateUserProfileDto.locationId ? { connect: { id: updateUserProfileDto.locationId } } : undefined,
      grade: updateUserProfileDto.grade,
      board: updateUserProfileDto.board,
      dateOfBirth: updateUserProfileDto.dateOfBirth ? new Date(updateUserProfileDto.dateOfBirth) : undefined,
      phoneNumber: updateUserProfileDto.phoneNumber,
      parentEmail: updateUserProfileDto.parentEmail,
      parentPhone: updateUserProfileDto.parentPhone,
      SchoolBranch: updateUserProfileDto.schoolBranchId ? { connect: { id: updateUserProfileDto.schoolBranchId } } : undefined,
      City: updateUserProfileDto.cityId ? { connect: { id: updateUserProfileDto.cityId } } : undefined,
    } as any;

    return this.prisma.userProfile.update({ where: { userId }, data }) as unknown as UserProfile;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.userProfile.delete({ where: { id } });
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.findByUserId(userId);
    await this.prisma.userProfile.delete({ where: { userId } });
  }

  async searchProfiles(params: {
    userType?: UserType;
    schoolId?: string;
    locationId?: string;
    grade?: number;
    board?: string;
    search?: string;
    cityId?: string;
    schoolBranchId?: string;
  }): Promise<UserProfile[]> {
    const { userType, schoolId, grade, board, search, cityId, schoolBranchId } = params;
    const where: Prisma.UserProfileWhereInput = {};

    if (userType) where.userType = userType;
    if (schoolId) where.schoolId = schoolId;
    if (cityId) where.cityId = cityId;
    if (schoolBranchId) where.schoolBranchId = schoolBranchId;
    if (grade) where.grade = grade;
    if (board) where.board = board as any;

    if (search) {
      where.OR = [
        { userId: { contains: search, mode: 'insensitive' } },
        { parentEmail: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.userProfile.findMany({
      where,
      include: {
        school: true,
        interests: true,
        SchoolBranch: true,
        City: true,
      },
      orderBy: { createdAt: 'desc' },
    }) as unknown as UserProfile[];
  }

  async addInterest(profileId: string, interest: string): Promise<void> {
    await this.findOne(profileId);

    const existingInterest = await this.prisma.userInterest.findFirst({ where: { profileId, interest } });
    if (existingInterest) {
      throw new ConflictException('Interest already exists for this profile');
    }

    await this.prisma.userInterest.create({ data: { profileId, interest } });
  }

  async removeInterest(profileId: string, interest: string): Promise<void> {
    await this.findOne(profileId);

    const existingInterest = await this.prisma.userInterest.findFirst({ where: { profileId, interest } });
    if (!existingInterest) {
      throw new NotFoundException('Interest not found for this profile');
    }

    await this.prisma.userInterest.delete({ where: { id: existingInterest.id } });
  }

  async getProfileStatistics(): Promise<any> {
    const [totalProfiles, profilesByType, profilesByGrade] = await Promise.all([
      this.prisma.userProfile.count(),
      this.prisma.userProfile.groupBy({ by: ['userType'], _count: { userType: true } }),
      this.prisma.userProfile.groupBy({ by: ['grade'], _count: { grade: true }, where: { grade: { not: null } } }),
    ]);

    return {
      totalProfiles,
      profilesByType: profilesByType.reduce((acc, item) => {
        acc[item.userType] = item._count.userType;
        return acc;
      }, {} as Record<string, number>),
      profilesByGrade: profilesByGrade.reduce((acc, item) => {
        acc[item.grade!] = item._count.grade;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}