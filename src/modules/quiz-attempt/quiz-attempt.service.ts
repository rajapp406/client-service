import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateQuizAttemptDto } from "./dto/create-quiz-attempt.dto";
import { UpdateQuizAttemptDto } from "./dto/update-quiz-attempt.dto";
import { CompleteQuizAttemptDto } from "./dto/complete-quiz-attempt.dto";
import { QuizAttempt } from "./entities/quiz-attempt.entity";
import { Prisma, AttemptStatus } from "../../../generated/prisma";

@Injectable()
export class QuizAttemptService {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService
  ) {}

  async create(
    createQuizAttemptDto: CreateQuizAttemptDto
  ): Promise<QuizAttempt> {
    // Verify quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: createQuizAttemptDto.quizId },
    });

    if (!quiz) {
      throw new NotFoundException(
        `Quiz with ID ${createQuizAttemptDto.quizId} not found`
      );
    }

    // Verify user exists in UserProfile
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId: createQuizAttemptDto.userId },
    });

    if (!userProfile) {
      throw new NotFoundException(
        `User with ID ${createQuizAttemptDto.userId} not found`
      );
    }

    // Check if there's already an active attempt for this quiz and user
    const existingAttempt = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId: createQuizAttemptDto.quizId,
        userId: createQuizAttemptDto.userId,
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    if (existingAttempt) {
      console.log(existingAttempt, "existing attempt");
      return existingAttempt;
      //throw new ConflictException('User already has an active attempt for this quiz');
    }

    return this.prisma.quizAttempt.create({
      data: {
        ...createQuizAttemptDto,
        status: createQuizAttemptDto.status || AttemptStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.QuizAttemptWhereUniqueInput;
    where?: Prisma.QuizAttemptWhereInput;
    orderBy?: Prisma.QuizAttemptOrderByWithRelationInput;
    includeQuiz?: boolean;
    includeStudent?: boolean;
    includeAnswers?: boolean;
  }): Promise<QuizAttempt[]> {
    const {
      skip,
      take,
      cursor,
      where,
      orderBy,
      includeQuiz,
      includeStudent,
      includeAnswers,
    } = params;
    return this.prisma.quizAttempt.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        quiz: includeQuiz,
        answers: includeAnswers,
      },
    });
  }

  async findOne(
    id: string,
    options: {
      includeAnswers?: boolean;
      includeQuiz?: boolean;
      includeQuestions?: boolean;
    } = {}
  ): Promise<QuizAttempt | null> {
    const { includeAnswers = false, includeQuiz = false, includeQuestions = false } = options;

    // Build include object based on options
    const include: any = {};
    
    if (includeAnswers) {
      include.answers = {
        include: {
          question: true
        }
      };
    }

    if (includeQuiz) {
      include.quiz = {
        include: includeQuestions ? {
          questions: {
            include: {
              question: {
                include: {
                  subject: true,
                  chapter: true
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          tags: true
        } : {
          tags: true
        }
      };
    }

    const quizAttempt = await this.prisma.quizAttempt.findUnique({
      where: { id },
      include: Object.keys(include).length > 0 ? include : undefined,
    });

    if (!quizAttempt) {
      throw new NotFoundException(`Quiz attempt with ID ${id} not found`);
    }

    return quizAttempt;
  }

  async update(
    id: string,
    updateQuizAttemptDto: UpdateQuizAttemptDto
  ): Promise<QuizAttempt> {
    // Check if quiz attempt exists
    const existingAttempt = await this.findOne(id, {});

    // Verify quiz exists if updating quizId
    if (updateQuizAttemptDto.quizId) {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id: updateQuizAttemptDto.quizId },
      });

      if (!quiz) {
        throw new NotFoundException(
          `Quiz with ID ${updateQuizAttemptDto.quizId} not found`
        );
      }
    }

    // Verify user exists if updating userId
    if (updateQuizAttemptDto.userId) {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId: updateQuizAttemptDto.userId },
      });

      if (!userProfile) {
        throw new NotFoundException(
          `User with ID ${updateQuizAttemptDto.userId} not found`
        );
      }
    }

    return this.prisma.quizAttempt.update({
      where: { id },
      data: updateQuizAttemptDto,
    });
  }

  async complete(
    id: string,
    completeQuizAttemptDto: CompleteQuizAttemptDto
  ): Promise<QuizAttempt> {
    const existingAttempt = await this.findOne(id, {});

    if (existingAttempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "Quiz attempt is not in progress and cannot be completed"
      );
    }

    return this.prisma.quizAttempt.update({
      where: { id },
      data: {
        ...completeQuizAttemptDto,
        status: AttemptStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  async abandon(id: string): Promise<QuizAttempt> {
    const existingAttempt = await this.findOne(id, {});

    if (existingAttempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "Quiz attempt is not in progress and cannot be abandoned"
      );
    }

    return this.prisma.quizAttempt.update({
      where: { id },
      data: {
        status: AttemptStatus.ABANDONED,
      },
    });
  }

  async pause(id: string): Promise<QuizAttempt> {
    const existingAttempt = await this.findOne(id, {});

    if (existingAttempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "Quiz attempt is not in progress and cannot be paused"
      );
    }

    return this.prisma.quizAttempt.update({
      where: { id },
      data: {
        status: AttemptStatus.PAUSED,
      },
    });
  }

  async resume(id: string): Promise<QuizAttempt> {
    const existingAttempt = await this.findOne(id, {});

    if (existingAttempt.status !== AttemptStatus.PAUSED) {
      throw new BadRequestException(
        "Quiz attempt is not paused and cannot be resumed"
      );
    }

    return this.prisma.quizAttempt.update({
      where: { id },
      data: {
        status: AttemptStatus.IN_PROGRESS,
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Check if quiz attempt exists
    await this.findOne(id, {});

    await this.prisma.quizAttempt.delete({
      where: { id },
    });
  }

  async getAttemptsByQuiz(
    quizId: string,
    options: {
      includeAnswers?: boolean;
      includeQuiz?: boolean;
      includeQuestions?: boolean;
    } = {}
  ): Promise<QuizAttempt[]> {
    const { includeAnswers = false, includeQuiz = false, includeQuestions = false } = options;

    // Verify quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Build include object based on options
    const include: any = {};
    
    if (includeAnswers) {
      include.answers = {
        include: {
          question: true
        }
      };
    }

    if (includeQuiz) {
      include.quiz = {
        include: includeQuestions ? {
          questions: {
            include: {
              question: {
                include: {
                  subject: true,
                  chapter: true
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          tags: true
        } : {
          tags: true
        }
      };
    }

    return this.prisma.quizAttempt.findMany({
      where: { quizId },
      orderBy: { startedAt: "desc" },
      include: Object.keys(include).length > 0 ? include : undefined,
    });
  }

  async getAttemptsByUser(
    userId: string,
    includeRelations = false
  ): Promise<QuizAttempt[]> {
    // Verify user exists
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      include: includeRelations
        ? {
            quiz: true,
            answers: true,
          }
        : undefined,
    });
  }

  async getAttemptsByStatus(
    status: AttemptStatus,
    includeRelations = false
  ): Promise<QuizAttempt[]> {
    return this.prisma.quizAttempt.findMany({
      where: { status },
      orderBy: { startedAt: "desc" },
      include: includeRelations
        ? {
            quiz: true,
            answers: true,
          }
        : undefined,
    });
  }

  async getAttemptStatistics(quizId?: string, userId?: string): Promise<any> {
    const where: Prisma.QuizAttemptWhereInput = {};

    if (quizId) where.quizId = quizId;
    if (userId) where.userId = userId;

    const [totalAttempts, completedAttempts, averageScore, averageTime] =
      await Promise.all([
        this.prisma.quizAttempt.count({ where }),
        this.prisma.quizAttempt.count({
          where: { ...where, status: AttemptStatus.COMPLETED },
        }),
        this.prisma.quizAttempt.aggregate({
          where: { ...where, status: AttemptStatus.COMPLETED },
          _avg: { score: true },
        }),
        this.prisma.quizAttempt.aggregate({
          where: { ...where, status: AttemptStatus.COMPLETED },
          _avg: { timeSpent: true },
        }),
      ]);

    return {
      totalAttempts,
      completedAttempts,
      completionRate:
        totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0,
      averageScore: averageScore._avg.score || 0,
      averageTimeSpent: averageTime._avg.timeSpent || 0,
    };
  }
}
