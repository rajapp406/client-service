import { Test, TestingModule } from '@nestjs/testing';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { CompleteQuizAttemptDto } from './dto/complete-quiz-attempt.dto';
import { AttemptStatus } from '../../../generated/prisma';

describe('QuizAttemptController', () => {
  let controller: QuizAttemptController;
  let service: QuizAttemptService;

  const mockQuizAttemptService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    complete: jest.fn(),
    abandon: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getAttemptsByQuiz: jest.fn(),
    getAttemptsByStudent: jest.fn(),
    getAttemptsByStatus: jest.fn(),
    getAttemptStatistics: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizAttemptController],
      providers: [
        {
          provide: QuizAttemptService,
          useValue: mockQuizAttemptService,
        },
      ],
    }).compile();

    controller = module.get<QuizAttemptController>(QuizAttemptController);
    service = module.get<QuizAttemptService>(QuizAttemptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a quiz attempt', async () => {
      const createQuizAttemptDto: CreateQuizAttemptDto = {
        quizId: 'quiz-1',
        userProfileId: 'student-1',
      };

      mockQuizAttemptService.create.mockResolvedValue(mockQuizAttempt);

      const result = await controller.create(createQuizAttemptDto);

      expect(service.create).toHaveBeenCalledWith(createQuizAttemptDto);
      expect(result).toEqual(mockQuizAttempt);
    });
  });

  describe('findAll', () => {
    it('should return all quiz attempts', async () => {
      const quizAttempts = [mockQuizAttempt];
      mockQuizAttemptService.findAll.mockResolvedValue(quizAttempts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({
        includeQuiz: undefined,
        includeStudent: undefined,
        includeAnswers: undefined,
        orderBy: { startedAt: 'desc' },
      });
      expect(result).toEqual(quizAttempts);
    });
  });

  describe('complete', () => {
    it('should complete a quiz attempt', async () => {
      const completeQuizAttemptDto: CompleteQuizAttemptDto = {
        timeSpent: 1800,
        score: 85.5,
        totalQuestions: 20,
        correctAnswers: 17,
        totalPoints: 85,
        maxPoints: 100,
      };

      const completedAttempt = {
        ...mockQuizAttempt,
        ...completeQuizAttemptDto,
        status: AttemptStatus.COMPLETED,
      };

      mockQuizAttemptService.complete.mockResolvedValue(completedAttempt);

      const result = await controller.complete('1', completeQuizAttemptDto);

      expect(service.complete).toHaveBeenCalledWith('1', completeQuizAttemptDto);
      expect(result).toEqual(completedAttempt);
    });
  });

  describe('abandon', () => {
    it('should abandon a quiz attempt', async () => {
      const abandonedAttempt = {
        ...mockQuizAttempt,
        status: AttemptStatus.ABANDONED,
      };

      mockQuizAttemptService.abandon.mockResolvedValue(abandonedAttempt);

      const result = await controller.abandon('1');

      expect(service.abandon).toHaveBeenCalledWith('1');
      expect(result).toEqual(abandonedAttempt);
    });
  });

  describe('getAttemptsByQuiz', () => {
    it('should return attempts for a quiz', async () => {
      const attempts = [mockQuizAttempt];
      mockQuizAttemptService.getAttemptsByQuiz.mockResolvedValue(attempts);

      const result = await controller.getAttemptsByQuiz('quiz-1');

      expect(service.getAttemptsByQuiz).toHaveBeenCalledWith('quiz-1', undefined);
      expect(result).toEqual(attempts);
    });
  });

  describe('getStatistics', () => {
    it('should return quiz attempt statistics', async () => {
      const stats = {
        totalAttempts: 100,
        completedAttempts: 80,
        completionRate: 80,
        averageScore: 75.5,
        averageTimeSpent: 1200,
      };

      mockQuizAttemptService.getAttemptStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics();

      expect(service.getAttemptStatistics).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(stats);
    });
  });
});