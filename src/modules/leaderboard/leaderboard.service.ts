import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import { Leaderboard } from './entities/leaderboard.entity';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class LeaderboardService {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService,
  ) {}

  async create(createLeaderboardDto: CreateLeaderboardDto): Promise<Leaderboard> {
    // Check if leaderboard entry for this user and school already exists
    const existingEntry = await this.prisma.leaderboard.findFirst({
      where: {
        schoolId: createLeaderboardDto.schoolId,
        userId: createLeaderboardDto.userId,
      },
    });

    if (existingEntry) {
      throw new ConflictException('Leaderboard entry for this user and school already exists');
    }

    // Verify school exists
    const school = await this.prisma.school.findUnique({
      where: { id: createLeaderboardDto.schoolId },
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${createLeaderboardDto.schoolId} not found`);
    }

    return this.prisma.leaderboard.create({
      data: {
        ...createLeaderboardDto,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.LeaderboardWhereUniqueInput;
    where?: Prisma.LeaderboardWhereInput;
    orderBy?: Prisma.LeaderboardOrderByWithRelationInput;
    includeSchool?: boolean;
  }): Promise<Leaderboard[]> {
    const { skip, take, cursor, where, orderBy, includeSchool } = params;
    return this.prisma.leaderboard.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: includeSchool ? { school: true } : undefined,
    });
  }

  async findOne(id: string, includeSchool = false): Promise<Leaderboard | null> {
    const leaderboard = await this.prisma.leaderboard.findUnique({
      where: { id },
      include: includeSchool ? { school: true } : undefined,
    });

    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard entry with ID ${id} not found`);
    }

    return leaderboard;
  }

  async update(id: string, updateLeaderboardDto: UpdateLeaderboardDto): Promise<Leaderboard> {
    // Check if leaderboard entry exists
    await this.findOne(id);

    // If updating school or user, check for conflicts
    if (updateLeaderboardDto.schoolId || updateLeaderboardDto.userId) {
      const existingEntry = await this.prisma.leaderboard.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              schoolId: updateLeaderboardDto.schoolId,
              userId: updateLeaderboardDto.userId,
            },
          ],
        },
      });

      if (existingEntry) {
        throw new ConflictException('Another leaderboard entry for this user and school already exists');
      }
    }

    // Verify school exists if updating schoolId
    if (updateLeaderboardDto.schoolId) {
      const school = await this.prisma.school.findUnique({
        where: { id: updateLeaderboardDto.schoolId },
      });

      if (!school) {
        throw new NotFoundException(`School with ID ${updateLeaderboardDto.schoolId} not found`);
      }
    }

    return this.prisma.leaderboard.update({
      where: { id },
      data: updateLeaderboardDto,
    });
  }

  async remove(id: string): Promise<void> {
    // Check if leaderboard entry exists
    await this.findOne(id);

    await this.prisma.leaderboard.delete({
      where: { id },
    });
  }

  async getLeaderboardBySchool(
    schoolId: string,
    params: {
      limit?: number;
      includeSchool?: boolean;
    } = {}
  ): Promise<Leaderboard[]> {
    const { limit = 10, includeSchool = false } = params;

    // Verify school exists
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    return this.prisma.leaderboard.findMany({
      where: { schoolId },
      orderBy: { rank: 'asc' },
      take: limit,
      include: includeSchool ? { school: true } : undefined,
    });
  }

  async getLeaderboardByUser(userId: string, includeSchool = false): Promise<Leaderboard[]> {
    return this.prisma.leaderboard.findMany({
      where: { userId },
      orderBy: { rank: 'asc' },
      include: includeSchool ? { school: true } : undefined,
    });
  }

  async updateUserRankings(schoolId: string): Promise<void> {
    // Get all leaderboard entries for the school ordered by total score
    const entries = await this.prisma.leaderboard.findMany({
      where: { schoolId },
      orderBy: { totalScore: 'desc' },
    });

    // Update ranks based on score order
    const updatePromises = entries.map((entry, index) =>
      this.prisma.leaderboard.update({
        where: { id: entry.id },
        data: { rank: index + 1 },
      })
    );

    await Promise.all(updatePromises);
  }

  async getTopPerformers(limit = 10): Promise<Leaderboard[]> {
    return this.prisma.leaderboard.findMany({
      orderBy: { totalScore: 'desc' },
      take: limit,
      include: { school: true },
    });
  }
}