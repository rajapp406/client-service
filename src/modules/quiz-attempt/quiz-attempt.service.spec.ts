import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { CompleteQuizAttemptDto } from './dto/complete-quiz-attempt.dto';
import { AttemptStatus } from '../../../generated/prisma';

describe('QuizAttemptService', () => {
  let service: QuizAttemptService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    quizAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    quiz: {
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
  };

  const mockQuizAttempt = {
    id: '1',
    quizId: 'quiz-1',
    studentId: 'student-1',
    startedAt: new Date(),
    completedAt: null,
    timeSpent: null,
    score: null,
    totalQuestions: null,
    correctAnswers: null,
    totalPoints: null,
    maxPoints: null,
    status: AttemptStatus.IN_PROGRESS,
  };

  const mockQuiz = {
    id: 'quiz-1',
    title: 'Test Quiz',
    description: 'Test Description',
  };

  const mockStudent = {
    id: 'student-1',
    userId: 'user-1',
    grade: 10,
    board: 'CBSE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizAttemptService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuizAttemptService>(QuizAttemptService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createQuizAttemptDto: CreateQuizAttemptDto = {
      quizId: 'quiz-1',
      studentId: 'student-1',
    };

    it('should create a quiz attempt successfully', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.quizAttempt.findFirst.mockResolvedValue(null);
      mockPrismaService.quizAttempt.create.mockResolvedValue(mockQuizAttempt);

      const result = await service.create(createQuizAttemptDto);

      expect(mockPrismaService.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: createQuizAttemptDto.quizId },
      });
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: createQuizAttemptDto.studentId },
      });
      expect(mockPrismaService.quizAttempt.findFirst).toHaveBeenCalledWith({
        where: {
          quizId: createQuizAttemptDto.quizId,
          studentId: createQuizAttemptDto.studentId,
          status: AttemptStatus.IN_PROGRESS,
        },
      });
      expect(result).toEqual(mockQuizAttempt);
    });

    it('should throw NotFoundException if quiz not found', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(null);

      await expect(service.create(createQuizAttemptDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(service.create(createQuizAttemptDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if active attempt exists', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.quizAttempt.findFirst.mockResolvedValue(mockQuizAttempt);

      await expect(service.create(createQuizAttemptDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('complete', () => {
    const completeQuizAttemptDto: CompleteQuizAttemptDto = {
      timeSpent: 1800,
      score: 85.5,
      totalQuestions: 20,
      correctAnswers: 17,
      totalPoints: 85,
      maxPoints: 100,
    };

    it('should complete a quiz attempt successfully', async () => {
      const completedAttempt = {
        ...mockQuizAttempt,
        ...completeQuizAttemptDto,
        status: AttemptStatus.COMPLETED,
        completedAt: new Date(),
      };

      mockPrismaService.quizAttempt.findUnique.mockResolvedValue(mockQuizAttempt);
      mockPrismaService.quizAttempt.update.mockResolvedValue(completedAttempt);

      const result = await service.complete('1', completeQuizAttemptDto);

      expect(mockPrismaService.quizAttempt.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...completeQuizAttemptDto,
          status: AttemptStatus.COMPLETED,
          completedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(completedAttempt);
    });

    it('should throw BadRequestException if attempt is not in progress', async () => {
      const completedAttempt = {
        ...mockQuizAttempt,
        status: AttemptStatus.COMPLETED,
      };
      mockPrismaService.quizAttempt.findUnique.mockResolvedValue(completedAttempt);

      await expect(service.complete('1', completeQuizAttemptDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('abandon', () => {
    it('should abandon a quiz attempt successfully', async () => {
      const abandonedAttempt = {
        ...mockQuizAttempt,
        status: AttemptStatus.ABANDONED,
      };

      mockPrismaService.quizAttempt.findUnique.mockResolvedValue(mockQuizAttempt);
      mockPrismaService.quizAttempt.update.mockResolvedValue(abandonedAttempt);

      const result = await service.abandon('1');

      expect(mockPrismaService.quizAttempt.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: AttemptStatus.ABANDONED },
      });
      expect(result).toEqual(abandonedAttempt);
    });
  });

  describe('getAttemptStatistics', () => {
    it('should return attempt statistics', async () => {
      mockPrismaService.quizAttempt.count
        .mockResolvedValueOnce(100) // total attempts
        .mockResolvedValueOnce(80); // completed attempts
      
      mockPrismaService.quizAttempt.aggregate
        .mockResolvedValueOnce({ _avg: { score: 75.5 } }) // average score
        .mockResolvedValueOnce({ _avg: { timeSpent: 1200 } }); // average time

      const result = await service.getAttemptStatistics();

      expect(result).toEqual({
        totalAttempts: 100,
        completedAttempts: 80,
        completionRate: 80,
        averageScore: 75.5,
        averageTimeSpent: 1200,
      });
    });
  });
});