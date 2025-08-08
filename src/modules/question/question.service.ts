import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Difficulty, Board, QuestionType, Prisma } from '../../../generated/prisma';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async create(questions: CreateQuestionDto[]): Promise<Question[]> {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestException('No questions provided. Please provide an array of questions.');
    }

    // Validate that at least one option is marked as correct and options are properly formatted
    questions.forEach((question, index) => {
      if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        throw new BadRequestException(`Question at index ${index} must have at least one option`);
      }

      // Validate each option has required fields
      const invalidOptions = question.options.filter(option => {
        return !option.text || typeof option.isCorrect !== 'boolean';
      });

      if (invalidOptions.length > 0) {
        throw new BadRequestException(
          `Question at index ${index} has invalid options. ` +
          'Each option must have a text (string) and isCorrect (boolean) property.'
        );
      }

      // Validate at least one correct option
      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        throw new BadRequestException(
          `Question at index ${index} must have at least one correct answer`
        );
      }
    });

    // Get all unique subject and chapter IDs for validation
    const subjectIds = [...new Set(questions.map(q => q.subjectId))];
    const chapterIds = questions
      .map(q => q.chapterId)
      .filter((id): id is string => Boolean(id));

    // Validate UUID format for subjectIds
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    const invalidSubjectIds = subjectIds.filter(id => !uuidRegex.test(id));
    if (invalidSubjectIds.length > 0) {
      throw new BadRequestException(
        `Invalid UUID format for subject IDs. Each ID must be in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. ` +
        `Invalid IDs: ${invalidSubjectIds.join(', ')}`
      );
    }

    // Validate subjects exist
    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true },
    });

    if (subjects.length !== subjectIds.length) {
      const foundSubjectIds = new Set(subjects.map(s => s.id));
      const missingSubjectIds = subjectIds.filter(id => !foundSubjectIds.has(id));
      throw new NotFoundException(`Subjects not found: ${missingSubjectIds.join(', ')}`);
    }

    // Validate chapters exist if provided
    if (chapterIds.length > 0) {
      const chapters = await this.prisma.chapter.findMany({
        where: { id: { in: chapterIds } },
        select: { id: true },
      });

      if (chapters.length !== [...new Set(chapterIds)].length) {
        const foundChapterIds = new Set(chapters.map(c => c.id));
        const missingChapterIds = chapterIds.filter(id => !foundChapterIds.has(id));
        throw new NotFoundException(`Chapters not found: ${missingChapterIds.join(', ')}`);
      }
    }

    // Create questions in a transaction
    return await this.prisma.$transaction(async (prisma) => {
      const createdQuestions = [];
      
      for (const questionData of questions) {
        const { subjectId, chapterId, ...rest } = questionData;
        
        const question = await prisma.quizQuestion.create({
          data: {
            ...rest,
            subject: { connect: { id: subjectId } },
            ...(chapterId && { chapter: { connect: { id: chapterId } } }),
          },
          include: {
            subject: true,
            chapter: true,
          },
        });
        
        createdQuestions.push(Question.fromPrisma(question));
      }
      
      return createdQuestions;
    });
  }

  async findAll(
    subjectId?: string, 
    chapterId?: string,
    page: number = 1,
    limit: number = 10
  ) {
    // Validate UUIDs if provided
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (subjectId && !uuidRegex.test(subjectId)) {
      throw new Error('Invalid subject ID format. ID must be a valid UUID.');
    }
    
    if (chapterId && !uuidRegex.test(chapterId)) {
      throw new Error('Invalid chapter ID format. ID must be a valid UUID.');
    }

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (chapterId) where.chapterId = chapterId;

    try {
      // Get total count for pagination
      const total = await this.prisma.quizQuestion.count({ where });
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      const take = +limit;

      const questions = await this.prisma.quizQuestion.findMany({
        where,
        include: {
          subject: true,
          chapter: true,
        },
        skip,
        take,
      });
      
      return {
        data: questions.map(question => Question.fromPrisma(question)),
        total
      };
    } catch (error) {
      throw new Error('Failed to retrieve questions: ' + error.message);
    }
  }

  async findOne(id: string): Promise<Question> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid question ID format. ID must be a valid UUID.');
    }

    const question = await this.prisma.quizQuestion.findUnique({
      where: { id },
      include: {
        subject: true,
        chapter: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return Question.fromPrisma(question);
  }

  async update(id: string, updateQuestionDto: Partial<CreateQuestionDto>): Promise<Question> {
    // Validate UUID format and check if question exists
    await this.findOne(id); // This will validate the ID format

    // Extract relation fields and create update data
    const { subjectId, chapterId, ...updateData } = updateQuestionDto;
    
    // Prepare the update data
    const updateInput: any = { ...updateData };
    
    // Handle subject relation if provided
    if (subjectId) {
      updateInput.subject = { connect: { id: subjectId } };
    }
    
    // Handle chapter relation if provided
    if (chapterId) {
      updateInput.chapter = { connect: { id: chapterId } };
    }

    // If options are being updated, validate them
    if (updateData.options) {
      if (!Array.isArray(updateData.options) || updateData.options.length === 0) {
        throw new BadRequestException('Question must have at least one option');
      }

      const hasCorrectAnswer = updateData.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        throw new BadRequestException('Question must have at least one correct answer');
      }
    }

    const updatedQuestion = await this.prisma.quizQuestion.update({
      where: { id },
      data: updateInput,
      include: {
        subject: true,
        chapter: true,
      },
    });

    return Question.fromPrisma(updatedQuestion);
  }

  async remove(id: string): Promise<void> {
    // Validate UUID format and check if question exists
    await this.findOne(id); // This will validate the ID format
    
    await this.prisma.quizQuestion.delete({
      where: { id },
    });
  }
}
