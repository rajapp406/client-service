import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './entities/school.entity';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class SchoolService {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    // Enforce unique name
    const existingSchool = await this.prisma.school.findUnique({
      where: { name: createSchoolDto.name },
    });

    if (existingSchool) {
      throw new ConflictException('School with this name already exists');
    }

    return this.prisma.school.create({
      data: {
        name: createSchoolDto.name,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SchoolWhereUniqueInput;
    where?: Prisma.SchoolWhereInput;
    orderBy?: Prisma.SchoolOrderByWithRelationInput;
  }): Promise<School[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.school.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: string): Promise<School | null> {
    const school = await this.prisma.school.findUnique({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }

    return school;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    // Check if school exists
    await this.findOne(id);

    // Check if another school with same name exists
    if (updateSchoolDto.name) {
      const existingSchool = await this.prisma.school.findFirst({
        where: {
          id: { not: id },
          name: updateSchoolDto.name,
        },
      });

      if (existingSchool) {
        throw new ConflictException('Another school with this name already exists');
      }
    }

    return this.prisma.school.update({
      where: { id },
      data: { name: updateSchoolDto.name },
    });
  }

  async remove(id: string): Promise<void> {
    // Check if school exists
    await this.findOne(id);

    await this.prisma.school.delete({
      where: { id },
    });
  }

  async searchSchools(params: {
    search?: string;
    cityId?: string;
  }): Promise<School[]> {
    const { search, cityId } = params;
    const where: Prisma.SchoolWhereInput = {};

    if (cityId) {
      where.branches = { some: { cityId } } as any;
    }

    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    return this.prisma.school.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getSchoolWithLeaderboard(id: string): Promise<School & { Leaderboard: any[] }> {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        Leaderboard: {
          orderBy: { rank: 'asc' },
          take: 10, // Top 10 students
        },
      },
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }

    return school as any;
  }
}