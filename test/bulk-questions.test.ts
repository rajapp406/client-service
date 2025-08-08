import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { QuestionType, Difficulty, Board } from '../src/generated/prisma';

describe('Bulk Questions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    // Create test data
    await prisma.subject.create({
      data: {
        id: 'test-subject-1',
        name: 'Mathematics',
        grade: 10,
        board: Board.CBSE,
      },
    });
    
    await prisma.chapter.create({
      data: {
        id: 'test-chapter-1',
        title: 'Algebra',
        chapterNumber: 1,
        subjectId: 'test-subject-1',
      },
    });

    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.quizQuestion.deleteMany({
      where: {
        subjectId: 'test-subject-1',
      },
    });
    await prisma.chapter.deleteMany({
      where: {
        id: 'test-chapter-1',
      },
    });
    await prisma.subject.deleteMany({
      where: {
        id: 'test-subject-1',
      },
    });
    
    await app.close();
  });

  it('should create multiple questions', async () => {
    const questions = [
      {
        questionText: 'What is 2+2?',
        questionType: QuestionType.MCQ,
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: '2+2 equals 4',
        difficulty: Difficulty.EASY,
        grade: 10,
        board: Board.CBSE,
        subjectId: 'test-subject-1',
        chapterId: 'test-chapter-1',
      },
      {
        questionText: 'What is 3*3?',
        questionType: QuestionType.MCQ,
        options: ['6', '9', '12', '15'],
        correctAnswer: '9',
        explanation: '3*3 equals 9',
        difficulty: Difficulty.EASY,
        grade: 10,
        board: Board.CBSE,
        subjectId: 'test-subject-1',
      },
    ];

    const response = await request(app.getHttpServer())
      .post('/questions/bulk')
      .send({ questions })
      .expect(201);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    
    // Verify the first question
    expect(response.body[0].questionText).toBe('What is 2+2?');
    expect(response.body[0].questionType).toBe(QuestionType.MCQ);
    expect(response.body[0].options).toEqual(['3', '4', '5', '6']);
    expect(response.body[0].correctAnswer).toBe('4');
    expect(response.body[0].explanation).toBe('2+2 equals 4');
    expect(response.body[0].difficulty).toBe(Difficulty.EASY);
    expect(response.body[0].grade).toBe(10);
    expect(response.body[0].board).toBe(Board.CBSE);
    expect(response.body[0].subjectId).toBe('test-subject-1');
    expect(response.body[0].chapterId).toBe('test-chapter-1');
    
    // Verify the second question
    expect(response.body[1].questionText).toBe('What is 3*3?');
    expect(response.body[1].questionType).toBe(QuestionType.MCQ);
    expect(response.body[1].options).toEqual(['6', '9', '12', '15']);
    expect(response.body[1].correctAnswer).toBe('9');
    expect(response.body[1].explanation).toBe('3*3 equals 9');
    expect(response.body[1].difficulty).toBe(Difficulty.EASY);
    expect(response.body[1].grade).toBe(10);
    expect(response.body[1].board).toBe(Board.CBSE);
    expect(response.body[1].subjectId).toBe('test-subject-1');
    expect(response.body[1].chapterId).toBeNull();
  });

  it('should validate required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/questions/bulk')
      .send({
        questions: [
          {
            // Missing required fields
            questionText: 'Test question',
            // Missing questionType, correctAnswer, grade, board, subjectId
          },
        ],
      })
      .expect(400);

    expect(response.body.message).toContain('The following required fields are missing');
  });

  it('should validate subject exists', async () => {
    const response = await request(app.getHttpServer())
      .post('/questions/bulk')
      .send({
        questions: [
          {
            questionText: 'Test question',
            questionType: QuestionType.MCQ,
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            grade: 10,
            board: Board.CBSE,
            subjectId: 'non-existent-subject',
          },
        ],
      })
      .expect(400);

    expect(response.body.message).toContain('not found');
  });

  it('should validate chapter exists and belongs to subject', async () => {
    const response = await request(app.getHttpServer())
      .post('/questions/bulk')
      .send({
        questions: [
          {
            questionText: 'Test question',
            questionType: QuestionType.MCQ,
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            grade: 10,
            board: Board.CBSE,
            subjectId: 'test-subject-1',
            chapterId: 'non-existent-chapter',
          },
        ],
      })
      .expect(400);

    expect(response.body.message).toContain('not found');
  });
});
