import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';

describe('QuestionController', () => {
  let controller: QuestionController;
  let service: QuestionService;

  const mockQuestion: CreateQuestionDto = {
    questionText: 'Test Q',
    questionType: 'MCQ',
    difficulty: 'EASY',
    options: [{ text: 'A', isCorrect: true, explanation: 'Test explanation' }],
    explanation: 'Test explanation',
    marks: 1,
    subjectId: '123e4567-e89b-12d3-a456-426614174001',
    chapterId: '123e4567-e89b-12d3-a456-426614174002',
    isActive: true,
    grade: 10,
    board: 'CBSE'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        {
          provide: QuestionService,
          useValue: {
            create: jest.fn().mockImplementation((dtos: CreateQuestionDto[]) => Promise.resolve(dtos)),
          },
        },
      ],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
    service = module.get<QuestionService>(QuestionService);
  });

  it('should create a single question', async () => {
    const questions = [mockQuestion];
    const result = await controller.create(questions);
    expect(result).toEqual(questions);
    expect(service.create).toHaveBeenCalledWith(questions);
  });

  it('should create multiple questions', async () => {
    const questions = [
      { ...mockQuestion, questionText: 'Q1' },
      { 
        ...mockQuestion, 
        questionText: 'Q2', 
        options: [{ text: 'B', isCorrect: true, explanation: 'Correct answer' }],
        grade: 9 
      }
    ];
    const result = await controller.create(questions);
    expect(result).toEqual(questions);
    expect(service.create).toHaveBeenCalledWith(questions);
  });
});
