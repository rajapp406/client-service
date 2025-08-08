import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus, Delete, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { ResponseUtil } from '../../common/utils/response.util';

@ApiTags('question')
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create one or more questions',
    description: 'Create a single question or multiple questions at once. Send an array of question objects.'
  })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/CreateQuestionDto',
      },
      example: [
        {
          chapterId: '123e4567-e89b-12d3-a456-426614174000',
          subjectId: '123e4567-e89b-12d3-a456-426614174001',
          grade: 10,
          board: 'CBSE',
          questionType: 'MCQ',
          questionText: 'What is 2+2?',
          options: '["2", "3", "4", "5"]',
          correctAnswer: '4',
          explanation: 'Detailed explanation of the answer',
          difficulty: 'MEDIUM',
          marks: 1,
          isActive: true
        }
      ]
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The question(s) have been successfully created.',
    type: [Question],
    isArray: true
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data'
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() questions: CreateQuestionDto[]) {
    if (!Array.isArray(questions) || questions.length === 0) {
      const response = ResponseUtil.error(
        'Request body must be a non-empty array of questions',
        'BAD_REQUEST',
        undefined,
        HttpStatus.BAD_REQUEST
      );
      return response;
    }
    try {
      const createdQuestions = await this.questionService.create(questions);
      const response = ResponseUtil.success(
        createdQuestions,
        'Questions created successfully',
        { statusCode: HttpStatus.CREATED }
      );
      return response;
    } catch (error) {
      const response = ResponseUtil.error(
        error.message || 'Failed to create questions',
        'INTERNAL_SERVER_ERROR'
      );
      return response;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all questions',
    description: 'Retrieve all questions with optional filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved all questions',
    type: [Question],
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('subjectId') subjectId?: string,
    @Query('chapterId') chapterId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    try {
      const { data, total } = await this.questionService.findAll(subjectId, chapterId, +page, +limit);
      const response = ResponseUtil.paginated(
        data,
        total,
        +page,
        +limit,
        'Questions retrieved successfully'
      );
      return response;
    } catch (error) {
      const response = ResponseUtil.error(
        error.message || 'Failed to retrieve questions',
        'INTERNAL_SERVER_ERROR'
      );
      return response;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a question by ID',
    description: 'Retrieve a single question by its ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved the question',
    type: Question,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Question not found',
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      const question = await this.questionService.findOne(id);
      if (!question) {
        const response = ResponseUtil.error(
          'Question not found',
          'NOT_FOUND',
          undefined,
          HttpStatus.NOT_FOUND
        );
        return response;
      }
      const response = ResponseUtil.success(question, 'Question retrieved successfully');
      return response;
    } catch (error) {
      const response = ResponseUtil.error(
        error.message || 'Failed to retrieve question',
        'INTERNAL_SERVER_ERROR'
      );
      return response;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a question',
    description: 'Update an existing question by ID',
  })
  @ApiBody({
    type: CreateQuestionDto,
    description: 'Question data to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Question successfully updated',
    type: Question,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Question not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: Partial<CreateQuestionDto>,
  ) {
    try {
      const updatedQuestion = await this.questionService.update(id, updateQuestionDto);
      const response = ResponseUtil.success(updatedQuestion, 'Question updated successfully');
      return response;
    } catch (error) {
      if (error.message === 'Question not found') {
        const response = ResponseUtil.error(
          'Question not found',
          'NOT_FOUND',
          undefined,
          HttpStatus.NOT_FOUND
        );
        return response;
      }
      const response = ResponseUtil.error(
        error.message || 'Failed to update question',
        'INTERNAL_SERVER_ERROR'
      );
      return response;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a question',
    description: 'Delete a question by ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Question successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Question not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.questionService.remove(id);
      const response = ResponseUtil.success(
        null,
        'Question deleted successfully',
        { statusCode: HttpStatus.NO_CONTENT }
      );
      return response;
    } catch (error) {
      if (error.message === 'Question not found') {
        const response = ResponseUtil.error(
          'Question not found',
          'NOT_FOUND',
          undefined,
          HttpStatus.NOT_FOUND
        );
        return response;
      }
      const response = ResponseUtil.error(
        error.message || 'Failed to delete question',
        'INTERNAL_SERVER_ERROR'
      );
      return response;
    }
  }
}
