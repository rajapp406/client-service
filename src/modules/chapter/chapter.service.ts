import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Chapter, ChapterWithRelations } from './entities/chapter.entity';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class ChapterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createChapterDto: CreateChapterDto): Promise<Chapter> {
    // Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: createChapterDto.subjectId },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${createChapterDto.subjectId} not found`);
    }

    // Check if chapter number is already taken for this subject
    if (createChapterDto.chapterNumber) {
      const existingChapter = await this.prisma.chapter.findFirst({
        where: {
          subjectId: createChapterDto.subjectId,
          chapterNumber: createChapterDto.chapterNumber,
        },
      });

      if (existingChapter) {
        throw new ConflictException(
          `Chapter with number ${createChapterDto.chapterNumber} already exists for this subject`,
        );
      }
    }

    // Prepare data for chapter creation
    const data: Prisma.ChapterCreateInput = {
      title: createChapterDto.title,
      subject: { connect: { id: createChapterDto.subjectId } },
      chapterNumber: createChapterDto.chapterNumber || undefined,
      content: createChapterDto.content,
      youtubeUrl: createChapterDto.youtubeUrl,
    };

    // Create the chapter
    const chapter = await this.prisma.chapter.create({
      data,
    });

    // If question IDs are provided, associate them with the chapter
    if (createChapterDto.questionIds && createChapterDto.questionIds.length > 0) {
      await this.updateChapterQuestions(chapter.id, createChapterDto.questionIds);
    }

    return chapter;
  }

  async findAllWithCount(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ChapterWhereUniqueInput;
    where?: Prisma.ChapterWhereInput;
    orderBy?: Prisma.ChapterOrderByWithRelationInput;
  }): Promise<[ChapterWithRelations[], number]> {
    const { skip, take, cursor, where, orderBy } = params;

    const [items, total] = await Promise.all([
      this.findAll(params),
      this.prisma.chapter.count({ where }),
    ]);
    return [items, total];
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ChapterWhereUniqueInput;
    where?: Prisma.ChapterWhereInput;
    orderBy?: Prisma.ChapterOrderByWithRelationInput;
  }): Promise<ChapterWithRelations[]> {
    const { skip, take, cursor, where, orderBy } = params;
    
    const chapters = await this.prisma.chapter.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            grade: true,
            board: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    return chapters.map(chapter => {
      const { _count, ...chapterData } = chapter;
      return new ChapterWithRelations({
        ...chapterData,
        questionCount: _count?.questions || 0,
      });
    });
  }

  async findOne(id: string): Promise<ChapterWithRelations> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            grade: true,
            board: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    return {
      ...chapter,
      questionCount: chapter._count?.questions || 0,
    };
  }

  async update(id: string, updateChapterDto: UpdateChapterDto): Promise<Chapter> {
    // Check if chapter exists
    await this.findOne(id);

    // If subjectId is being updated, check if the new subject exists
    if (updateChapterDto.subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: updateChapterDto.subjectId },
      });

      if (!subject) {
        throw new NotFoundException(`Subject with ID ${updateChapterDto.subjectId} not found`);
      }
    }

    // If chapter number is being updated, check for conflicts
    if (updateChapterDto.chapterNumber !== undefined) {
      const existingChapter = await this.prisma.chapter.findFirst({
        where: {
          id: { not: id },
          subjectId: updateChapterDto.subjectId || (await this.findOne(id)).subjectId,
          chapterNumber: updateChapterDto.chapterNumber,
        },
      });

      if (existingChapter) {
        throw new ConflictException(
          `Chapter with number ${updateChapterDto.chapterNumber} already exists for this subject`,
        );
      }
    }

    // Prepare update data
    const data: Prisma.ChapterUpdateInput = {
      ...(updateChapterDto.title && { title: updateChapterDto.title }),
      ...(updateChapterDto.subjectId && { subject: { connect: { id: updateChapterDto.subjectId } } }),
      ...(updateChapterDto.chapterNumber !== undefined && { 
        chapterNumber: updateChapterDto.chapterNumber 
      }),
      ...(updateChapterDto.content !== undefined && { content: updateChapterDto.content }),
      ...(updateChapterDto.youtubeUrl !== undefined && { youtubeUrl: updateChapterDto.youtubeUrl }),
    };

    // Update the chapter
    const updatedChapter = await this.prisma.chapter.update({
      where: { id },
      data,
    });

    // If question IDs are provided, update the chapter-question relationships
    if (updateChapterDto.questionIds) {
      await this.updateChapterQuestions(id, updateChapterDto.questionIds);
    }

    return updatedChapter;
  }

  async remove(id: string): Promise<void> {
    // Check if chapter exists
    await this.findOne(id);

    // Check if chapter has any questions
    const questionCount = await this.prisma.quizQuestion.count({
      where: { chapterId: id },
    });

    if (questionCount > 0) {
      throw new BadRequestException(
        'Cannot delete chapter as it has associated questions. Remove the questions first.',
      );
    }

    await this.prisma.chapter.delete({
      where: { id },
    });
  }

  async findChaptersBySubject(subjectId: string): Promise<ChapterWithRelations[]> {
    // Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return this.findAll({
      where: { subjectId },
      orderBy: { chapterNumber: 'asc' },
    });
  }

  private async updateChapterQuestions(chapterId: string, questionIds: string[]): Promise<void> {
    // Verify all questions exist
    const questions = await this.prisma.quizQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true },
    });

    if (questions.length !== questionIds.length) {
      const foundIds = new Set(questions.map(q => q.id));
      const missingIds = questionIds.filter(id => !foundIds.has(id));
      throw new NotFoundException(`Questions not found: ${missingIds.join(', ')}`);
    }

    // Update chapter for all specified questions
    await this.prisma.quizQuestion.updateMany({
      where: { id: { in: questionIds } },
      data: { chapterId },
    });
  }
}
