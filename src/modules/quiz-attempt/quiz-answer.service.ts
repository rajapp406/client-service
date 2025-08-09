import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { BulkSubmitAnswersDto } from './dto/bulk-submit-answers.dto';
import { AttemptStatus, QuestionType } from '../../../generated/prisma';

@Injectable()
export class QuizAnswerService {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService,
  ) {}

  async submitAnswer(submitAnswerDto: SubmitAnswerDto) {
    const { quizAttemptId, questionId, selectedOption, textAnswer, timeSpent } = submitAnswerDto;

    // Verify quiz attempt exists and is in progress
    const quizAttempt = await this.prisma.quizAttempt.findUnique({
      where: { id: quizAttemptId },
      include: { quiz: true }
    });

    if (!quizAttempt) {
      throw new NotFoundException(`Quiz attempt with ID ${quizAttemptId} not found`);
    }

    if (quizAttempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Quiz attempt is not in progress');
    }

    // Verify question exists and belongs to the quiz
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Verify question belongs to this quiz
    const quizQuestion = await this.prisma.quizToQuestion.findUnique({
      where: {
        quizId_questionId: {
          quizId: quizAttempt.quizId,
          questionId: questionId
        }
      }
    });

    if (!quizQuestion) {
      throw new BadRequestException('Question does not belong to this quiz');
    }

    // Check if answer already exists for this question
    const existingAnswer = await this.prisma.quizAnswer.findFirst({
      where: {
        quizAttemptId,
        questionId
      }
    });

    // Validate answer format based on question type
    this.validateAnswerFormat(question.questionType, selectedOption, textAnswer);

    // Calculate if answer is correct and points earned
    const { isCorrect, pointsEarned } = await this.evaluateAnswer(
      question, 
      selectedOption, 
      textAnswer, 
      quizQuestion.points
    );

    const answerData = {
      quizAttemptId,
      questionId,
      selectedOption,
      textAnswer,
      isCorrect,
      pointsEarned,
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    };

    // Update or create answer
    if (existingAnswer) {
      return this.prisma.quizAnswer.update({
        where: { id: existingAnswer.id },
        data: answerData
      });
    } else {
      return this.prisma.quizAnswer.create({
        data: answerData
      });
    }
  }

  async bulkSubmitAnswers(quizAttemptId: string, bulkSubmitDto: BulkSubmitAnswersDto) {
    // Verify quiz attempt exists and is in progress
    const quizAttempt = await this.prisma.quizAttempt.findUnique({
      where: { id: quizAttemptId },
      include: { quiz: true }
    });

    if (!quizAttempt) {
      throw new NotFoundException(`Quiz attempt with ID ${quizAttemptId} not found`);
    }

    if (quizAttempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Quiz attempt is not in progress');
    }

    const results = [];

    // Process each answer in a transaction
    await this.prisma.$transaction(async (tx) => {
      for (const answer of bulkSubmitDto.answers) {
        const submitDto: SubmitAnswerDto = {
          quizAttemptId,
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          textAnswer: answer.textAnswer,
          timeSpent: answer.timeSpent
        };

        const result = await this.submitAnswer(submitDto);
        results.push(result);
      }
    });

    return results;
  }

  async getAnswersForAttempt(quizAttemptId: string) {
    const quizAttempt = await this.prisma.quizAttempt.findUnique({
      where: { id: quizAttemptId }
    });

    if (!quizAttempt) {
      throw new NotFoundException(`Quiz attempt with ID ${quizAttemptId} not found`);
    }

    return this.prisma.quizAnswer.findMany({
      where: { quizAttemptId },
      include: {
        question: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            explanation: true
          }
        }
      },
      orderBy: { answeredAt: 'asc' }
    });
  }

  async calculateQuizScore(quizAttemptId: string) {
    const answers = await this.prisma.quizAnswer.findMany({
      where: { quizAttemptId },
      include: {
        question: true
      }
    });

    const totalQuestions = answers.length;
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const totalPoints = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const maxPoints = answers.reduce((sum, answer) => {
      const quizQuestion = answer.question;
      // Get points for this question from QuizToQuestion
      return sum + 1; // Default 1 point per question, should be fetched from QuizToQuestion
    }, 0);

    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      correctAnswers,
      totalPoints,
      maxPoints,
      score: Math.round(score * 100) / 100 // Round to 2 decimal places
    };
  }

  async autoCompleteQuiz(quizAttemptId: string) {
    const scoreData = await this.calculateQuizScore(quizAttemptId);
    
    const quizAttempt = await this.prisma.quizAttempt.findUnique({
      where: { id: quizAttemptId }
    });

    if (!quizAttempt) {
      throw new NotFoundException(`Quiz attempt with ID ${quizAttemptId} not found`);
    }

    const timeSpent = quizAttempt.startedAt ? 
      Math.floor((new Date().getTime() - quizAttempt.startedAt.getTime()) / 1000) : 0;

    return this.prisma.quizAttempt.update({
      where: { id: quizAttemptId },
      data: {
        ...scoreData,
        timeSpent,
        status: AttemptStatus.COMPLETED,
        completedAt: new Date()
      }
    });
  }

  private validateAnswerFormat(questionType: QuestionType, selectedOption?: string, textAnswer?: string) {
    switch (questionType) {
      case QuestionType.MCQ:
      case QuestionType.TRUE_FALSE:
        if (!selectedOption) {
          throw new BadRequestException(`Selected option is required for ${questionType} questions`);
        }
        break;
      case QuestionType.FILL_BLANK:
        if (!textAnswer) {
          throw new BadRequestException('Text answer is required for FILL_BLANK questions');
        }
        break;
      default:
        throw new BadRequestException('Invalid question type');
    }
  }

  private async evaluateAnswer(
    question: any, 
    selectedOption?: string, 
    textAnswer?: string, 
    maxPoints: number = 1
  ): Promise<{ isCorrect: boolean; pointsEarned: number }> {
    let isCorrect = false;

    switch (question.questionType) {
      case QuestionType.MCQ:
      case QuestionType.TRUE_FALSE:
        // Parse options JSON to find correct answer
        const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options);
        const correctOption = options.find((opt: any) => opt.isCorrect);
        isCorrect = correctOption && selectedOption === correctOption.text;
        break;

      case QuestionType.FILL_BLANK:
        // For fill-in-the-blank, we need to implement text matching logic
        // This is a simplified version - you might want more sophisticated matching
        const options2 = Array.isArray(question.options) ? question.options : JSON.parse(question.options);
        const correctAnswers = options2.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.text.toLowerCase());
        isCorrect = correctAnswers.some((correct: string) => 
          textAnswer?.toLowerCase().trim() === correct.trim()
        );
        break;

      default:
        isCorrect = false;
    }

    const pointsEarned = isCorrect ? maxPoints : 0;

    return { isCorrect, pointsEarned };
  }
}