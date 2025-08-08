import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class SubjectService {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    // Check if subject with same name, grade and board already exists
    const existingSubject = await this.prisma.subject.findFirst({
      where: {
        name: createSubjectDto.name,
        grade: createSubjectDto.grade,
        board: createSubjectDto.board,
      },
    });
console.log(existingSubject)
    if (existingSubject) {
      throw new ConflictException('Subject with this name, grade and board already exists');
    }

    return this.prisma.subject.create({
      data: {
        ...createSubjectDto,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SubjectWhereUniqueInput;
    where?: Prisma.SubjectWhereInput;
    orderBy?: Prisma.SubjectOrderByWithRelationInput;
  }): Promise<Subject[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.subject.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: string): Promise<Subject | null> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    // Check if subject exists
    await this.findOne(id);

    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
    });
  }

  async remove(id: string): Promise<void> {
    // Check if subject exists
    await this.findOne(id);

    await this.prisma.subject.delete({
      where: { id },
    });
  }

  async searchSubjects(params: {
    grade?: number;
    board?: string;
    search?: string;
  }): Promise<Subject[]> {
    const { grade, board, search } = params;
    const where: Prisma.SubjectWhereInput = {};

    if (grade) {
      where.grade = Number(grade);
    }

    if (board) {
      where.board = board as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }
}
