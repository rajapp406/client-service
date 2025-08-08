import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Board, Prisma } from '../../../generated/prisma';

@Injectable()
export class LearnService {
  private readonly logger = new Logger(LearnService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all subjects with optional filtering
   */
  async getAllSubjects(filters?: {
    grade?: number;
    board?: Board;
    search?: string;
  }) {
    const where: Prisma.SubjectWhereInput = {};
    
    if (filters) {
      if (filters.grade) where.grade = filters.grade;
      if (filters.board) where.board = filters.board;
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
    }

    try {
      return await this.prisma.subject.findMany({
        where,
        include: {
          chapters: true,
          _count: {
            select: { chapters: true, questions: true }
          }
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      this.logger.error(`Failed to fetch subjects: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a single subject by ID with related data
   */
  async getSubjectById(id: string) {
    try {
      const subject = await this.prisma.subject.findUnique({
        where: { id },
        include: {
          chapters: {
            orderBy: { chapterNumber: 'asc' },
            include: {
              _count: {
                select: { questions: true }
              }
            }
          },
          _count: {
            select: { questions: true, chapters: true }
          }
        }
      });

      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }

      return subject;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2023') {
          throw new NotFoundException('Invalid subject ID format');
        }
      }
      throw error;
    }
  }

  /**
   * Create a new subject
   */
  async createSubject(data: {
    name: string;
    grade: number;
    board: Board;
    description?: string;
    iconUrl?: string;
  }) {
    try {
      // Check if subject with same name, grade and board already exists
      const existingSubject = await this.prisma.subject.findFirst({
        where: {
          name: data.name,
          grade: data.grade,
          board: data.board,
        },
      });

      if (existingSubject) {
        throw new ConflictException(
          `A subject with name '${data.name}' for grade ${data.grade} and board ${data.board} already exists`
        );
      }

      return await this.prisma.subject.create({
        data: {
          name: data.name,
          grade: data.grade,
          board: data.board,
          iconUrl: data.iconUrl,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create subject: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a subject
   */
  async updateSubject(
    id: string, 
    data: {
      name?: string;
      description?: string;
      grade?: number;
      board?: Board;
      iconUrl?: string | null;
    }
  ) {
    // First verify the subject exists
    await this.getSubjectById(id);

    try {
      // If name, grade or board is being updated, check for conflicts
      if (data.name || data.grade || data.board) {
        const existingSubject = await this.prisma.subject.findFirst({
          where: {
            AND: [
              { id: { not: id } }, // Exclude current subject
              { name: data.name },
              { grade: data.grade },
              { board: data.board },
            ],
          },
        });

        if (existingSubject) {
          throw new ConflictException(
            `Another subject with the same name, grade, and board already exists`
          );
        }
      }

      return await this.prisma.subject.update({
        where: { id },
        data: {
          ...data,
          // Handle setting iconUrl to null explicitly
          ...(data.iconUrl === null ? { iconUrl: null } : {}),
        },
        include: {
          chapters: {
            orderBy: { chapterNumber: 'asc' },
            include: {
              _count: {
                select: { questions: true }
              }
            }
          },
          _count: {
            select: { chapters: true, questions: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update subject: ${error.message}`, error.stack);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Subject with these details already exists');
        }
      }
      
      throw error;
    }
  }

  /**
   * Delete a subject and its related data
   */
  async deleteSubject(id: string) {
    // First verify the subject exists
    await this.getSubjectById(id);

    try {
      // Use a transaction to ensure data consistency
      return await this.prisma.$transaction(async (prisma) => {
        // Delete related data first
        await prisma.chapter.deleteMany({
          where: { subjectId: id }
        });
        
        // Delete subject
        await prisma.subject.delete({ 
          where: { id }
        });
        
        return { 
          success: true, 
          message: 'Subject and all related data deleted successfully' 
        };
      });
    } catch (error) {
      this.logger.error(`Failed to delete subject: ${error.message}`, error.stack);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Subject with ID ${id} not found`);
        }
      }
      
      throw error;
    }
  }

  // Seed sample subjects into the database
  async seedSubjects() {
    const sampleSubjects = [
      {
        name: 'Mathematics',
        grade: 1,
        board: 'CBSE',
      },
      {
        name: 'Science',
        grade: 1,
        board: 'CBSE',
      },
      {
        name: 'English',
        grade: 1,
        board: Board.CBSE,
      },
      {
        name: 'History',
        grade: 1,
        board: Board.CBSE,
      },
      {
        name: 'Computer Science',
        grade: 1,
        board: Board.CBSE,
      },
    ];

    try {
      // Delete existing subjects (optional, remove if you want to keep existing data)
      await this.prisma.subject.deleteMany({});
      
      // Create new subjects
      const createdSubjects = await Promise.all(
        sampleSubjects.map((subject) =>
          this.prisma.subject.create({
            data: {
              ...subject,
              grade: 1,
              board: Board.CBSE,
            },
          })
        )
      );

      this.logger.log(`Successfully seeded ${createdSubjects.length} subjects`);
      return createdSubjects;
    } catch (error) {
      this.logger.error('Error seeding subjects:', error);
      throw error;
    }
  }
}
