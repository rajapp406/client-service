import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto, PaginatedQuizResponseDto } from './dto/quiz.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/quiz-question.dto';
import { Board, Prisma, Quiz, QuizQuestion, QuizType } from '../../../generated/prisma';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  // Quiz CRUD Operations
  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const { questionIds, subjectId, createdById, grade, board, ...quizData } = createQuizDto;
    
    // Prepare the data for quiz creation
    const quizCreateData: Prisma.QuizCreateInput = {
      ...quizData,
      // Use provided createdById or default to 'system' if not provided
      createdById: createdById || 'system',
      // Set primary grade and board if provided
      ...(grade && { primaryGrade: grade }),
      ...(board && { primaryBoard: board }),
      // Connect primary subject if provided
      ...(subjectId && { 
        primarySubject: { 
          connect: { 
            id: subjectId 
          } 
        } 
      })
    };

    try {
      const quiz = await this.prisma.quiz.create({
        data: quizCreateData,
        include: {
          primarySubject: true,
          _count: {
            select: { 
              attempts: true,
              questions: true
            },
          },
        },
      });
      // Create QuizToQuestion join records
      if (questionIds && questionIds.length > 0) {
        await this.prisma.quizToQuestion.createMany({
          data: questionIds.map(qid => ({ quizId: quiz.id, questionId: qid, order: 1 }))
        });
      }
      return quiz;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A quiz with this title already exists');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Subject not found');
        }
      }
      throw error;
    }
  }

  async findQuizzesByChapter(chapterId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    
    // First, verify the chapter exists
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, subjectId: true }
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${chapterId} not found`);
    }

    // Find all question IDs for this chapter
    const chapterQuestions = await this.prisma.quizQuestion.findMany({
      where: { chapterId },
      select: { id: true },
    });
    
    const questionIds: string[] = chapterQuestions.map(q => q.id);
    
    if (questionIds.length === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    // Find quizzes that have any of these questions
    const where: Prisma.QuizWhereInput = {
      questions: {
        some: {
          questionId: {
            in: questionIds as string[]
          }
        }
      },
      // Optionally, you can also filter by the chapter's subject
      OR: [
        { primarySubjectId: chapter.subjectId },
        { primarySubjectId: null } // Include quizzes without a primary subject
      ]
    };

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        distinct: ['id'], // Ensure unique quizzes
        skip,
        take: limit,
        include: {
          primarySubject: true,
          questions: { 
            where: {
              questionId: {
                in: questionIds
              }
            },
            select: { 
              question: true,
              order: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: { 
              attempts: true,
              questions: true
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quiz.count({
        where
      })
    ]);

    return {
      data: quizzes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllQuizzes(
    page: number = 1,
    limit: number = 10,
    type?: QuizType,
    subjectId?: string,
    grade?: string,
    board?: Board,
  ): Promise<PaginatedQuizResponseDto> {
    const skip = (page - 1) * limit;
    const where: Prisma.QuizWhereInput = {};
    
    // Filter by primary subject if provided
    if (subjectId) {
      where.primarySubjectId = subjectId;
    }
    
    // Filter by primary grade if provided
    if (grade !== undefined) {
      where.primaryGrade = parseInt(grade, 10);
    }
    
    // Filter by primary board if provided
    if (board) {
      where.primaryBoard = board;
    }
    
    // Filter by quiz type if provided
    if (type) {
      where.type = type;
    }
    console.log('where', where);
    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        include: {
          primarySubject: true,
          questions: { 
            select: { 
              question: true,
              order: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          _count: { 
            select: { 
              attempts: true,
              questions: true
            } 
          },
        },
        orderBy: { 
          createdAt: 'desc' 
        },
      }),
      this.prisma.quiz.count({ where })
    ]);
    
    // Transform the response to include question details and pagination
    return {
      data: quizzes.map(quiz => ({
        ...quiz,
        questions: quiz.questions.map(q => q.question), // Flatten the questions
        questionCount: quiz._count.questions, // Add question count
        attemptCount: quiz._count.attempts, // Add attempt count
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async findQuizById(id: string): Promise<any> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        primarySubject: true,
        questions: { 
          include: { 
            question: true 
          } 
        },
        _count: {
          select: { 
            attempts: true,
            questions: true 
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // Transform the response to include question details and counts
    return {
      ...quiz,
      questions: quiz.questions.map(q => q.question), // Flatten the questions
      questionCount: quiz._count.questions,
      attemptCount: quiz._count.attempts,
    };
  }

  async updateQuiz(id: string, updateQuizDto: UpdateQuizDto): Promise<any> {
    await this.findQuizById(id); // Check if exists
    const { questionIds, subjectId, grade, board, ...quizData } = updateQuizDto;
    
    // Prepare the update data
    const updateData: Prisma.QuizUpdateInput = {
      ...quizData,
      ...(grade !== undefined && { primaryGrade: grade }),
      ...(board && { primaryBoard: board }),
      ...(subjectId !== undefined 
        ? subjectId 
          ? { primarySubject: { connect: { id: subjectId } } } 
          : { primarySubject: { disconnect: true } }
        : {}
      )
    };
    
    try {
      // First update the quiz data
      await this.prisma.quiz.update({
        where: { id },
        data: updateData,
      });
      
      // Handle question associations if provided
      if (questionIds) {
        // Remove all old associations
       // await this.prisma.quizToQuestion.deleteMany({ where: { quizId: id } });
        
        // Add new associations if any
        if (questionIds.length > 0) {
          await this.prisma.quizToQuestion.createMany({
            data: questionIds.map(questionId => ({
              quizId: id,
              questionId,
              order: 1,
              points: 1
            }))
          });
        }
      }
      
      // Return the fully updated quiz with all relations
      return this.findQuizById(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A quiz with this title already exists');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Subject not found');
        }
      }
      throw error;
    }
  }

  async removeQuiz(id: string): Promise<Quiz> {
    await this.findQuizById(id); // Check if exists
    // Cascade will handle all related deletes
    return this.prisma.quiz.delete({ where: { id } });
  }

  // Question CRUD Operations
  async createQuestion(createQuestionDto: CreateQuestionDto): Promise<QuizQuestion> {
    return this.prisma.quizQuestion.create({
      data: {
        chapterId: createQuestionDto.chapterId,
        subjectId: createQuestionDto.subjectId,
        grade: createQuestionDto.grade,
        board: createQuestionDto.board,
        questionType: createQuestionDto.questionType,
        questionText: createQuestionDto.questionText,
        options: createQuestionDto.options,
        explanation: createQuestionDto.explanation,
        difficulty: createQuestionDto.difficulty,
      },
    });
  }

  async addQuestionToQuiz(quizId: string, questionId: string) {
    // Check if quiz exists
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }
    // Check if question exists
    const question = await this.prisma.quizQuestion.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }
    // Check if already associated
    const existing = await this.prisma.quizToQuestion.findUnique({ where: { quizId_questionId: { quizId, questionId } } });
    if (!existing) {
      await this.prisma.quizToQuestion.create({ data: { quizId, questionId, order: 1 } });
    }
    return this.findQuizById(quizId);
  }

  async getQuestions(quizId: string): Promise<QuizQuestion[]> {
    // Verify the quiz exists and load questions with their relations
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                chapter: true,
                subject: true
              }
            }
          },
          orderBy: {
            order: 'asc' // Maintain the order in which questions were added
          }
        }
      }
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Return the question objects with their relations
    return quiz.questions.map(qtq => ({
      ...qtq.question,
      // Include any additional fields from the join table if needed
      order: qtq.order,
      points: qtq.points,
      // Flatten the relations for easier access
      chapter: qtq.question.chapter,
      subject: qtq.question.subject
    }));
  }

  async getQuestion(questionId: string) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        chapter: true,
        subject: true,
        quizzes: {
          select: {
            quiz: {
              select: {
                id: true,
                title: true,
                type: true
              }
            }
          }
        }
      }
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Create a new object with the properties we want to return
    const result = {
      ...question,
      // Flatten the quizzes array
      usedInQuizzes: question.quizzes.map(q => q.quiz)
    };

    // Type assertion to handle the dynamic properties
    return result as unknown as QuizQuestion & { usedInQuizzes: Array<{ id: string; title: string; type: string }> };
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    // First verify the question exists
    await this.getQuestion(questionId);

    try {
      // Create a new object with only the fields we want to update
      const { chapterId, subjectId, ...updateFields } = updateQuestionDto;
      
      // Prepare the update data with proper typing
      const updateData: Prisma.QuizQuestionUpdateInput = { ...updateFields };

      // Handle chapter and subject connections if their IDs are provided
      if (chapterId) {
        updateData.chapter = { connect: { id: chapterId } };
      }
      if (subjectId) {
        updateData.subject = { connect: { id: subjectId } };
      }
      
      const updatedQuestion = await this.prisma.quizQuestion.update({
        where: { id: questionId },
        data: updateData,
        include: {
          chapter: true,
          subject: true,
          quizzes: {
            include: {
              quiz: true
            }
          }
        }
      });

      return updatedQuestion;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A question with similar data already exists');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Related chapter or subject not found');
        }
      }
      throw error;
    }
  }

  async removeQuestion(questionId: string): Promise<{ success: boolean; message: string }> {
    // First verify the question exists
    await this.getQuestion(questionId);
    
    try {
      // Check if the question is used in any quizzes
      const quizUsage = await this.prisma.quizToQuestion.findFirst({
        where: { questionId }
      });
      
      if (quizUsage) {
        throw new ConflictException(
          'Cannot delete question because it is being used in one or more quizzes. ' +
          'Please remove it from all quizzes before deleting.'
        );
      }
      
      // If not used in any quizzes, safe to delete
      await this.prisma.quizQuestion.delete({ 
        where: { id: questionId } 
      });
      
      return {
        success: true,
        message: 'Question deleted successfully'
      };
      
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Question with ID ${questionId} not found`);
        }
      }
      throw error;
    }
  }
}
