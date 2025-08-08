import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  ParseUUIDPipe, 
  Delete, 
  Put, 
  ParseIntPipe, 
  DefaultValuePipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizResponseDto } from './dto/quiz.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/quiz-question.dto';
import { ResponseUtil } from '../../common/utils/response.util';
import { QuizType, Board } from '../../../generated/prisma';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new quiz',
    description: `Creates a new quiz with the provided details.
    
    Required fields: title, type, grade
    Optional fields: board, subjectId, timeLimit, questionIds, createdById
    
    If createdById is not provided, it will default to 'system'`
  })
  @ApiCreatedResponse({ 
    description: 'The quiz has been successfully created.',
    type: QuizResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - Quiz with this title already exists' })
  async create(@Body() createQuizDto: CreateQuizDto) {
    const quiz = await this.quizService.createQuiz(createQuizDto);
    return ResponseUtil.success(quiz, 'Quiz created successfully');
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all quizzes with optional filters'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: QuizType })
  @ApiQuery({ name: 'subjectId', required: false, type: String })
  @ApiQuery({ name: 'grade', required: false, type: String })
  @ApiQuery({ name: 'board', required: false, enum: Board })
  @ApiOkResponse({ 
    description: 'Returns a paginated list of quizzes',
    type: Object
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('type') type?: QuizType,
    @Query('subjectId') subjectId?: string,
    @Query('grade') grade?: string,
    @Query('board') board?: Board,
  ) {
    const result = await this.quizService.findAllQuizzes(
      page,
      limit,
      type,
      subjectId,
      grade,
      board,
    );
    return ResponseUtil.paginated(
      result.data,
      result.pagination.total,
      result.pagination.page,
      result.pagination.limit,
      'Quizzes retrieved successfully'
    );
  }

  @Get('chapter/:chapterId')
  @ApiOperation({ 
    summary: 'Get quizzes by chapter ID',
    description: 'Returns all quizzes that contain questions from the specified chapter'
  })
  @ApiParam({ name: 'chapterId', description: 'ID of the chapter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiOkResponse({
    description: 'Returns a paginated list of quizzes for the specified chapter',
    type: Object
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Chapter not found' 
  })
  async findQuizzesByChapter(
    @Param('chapterId', new ParseUUIDPipe()) chapterId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    const result = await this.quizService.findQuizzesByChapter(chapterId, page, limit);
    return ResponseUtil.paginated(
      result.items,
      result.meta.total,
      result.meta.page,
      result.meta.limit,
      'Quizzes retrieved successfully'
    );
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get quiz by ID',
    description: 'Returns a single quiz with its questions.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the quiz to retrieve',
    example: '123e4567-e89b-41d4-a716-446655440000'
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved the quiz.',
    type: QuizResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Quiz not found.' 
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const quiz = await this.quizService.findQuizById(id);
    return ResponseUtil.success(quiz, 'Quiz retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update a quiz',
    description: 'Updates the details of an existing quiz.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the quiz to update',
    example: '123e4567-e89b-41d4-a716-446655440000'
  })
  @ApiOkResponse({ 
    description: 'The quiz has been successfully updated.',
    type: QuizResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Quiz not found.' 
  })
  @ApiBody({ type: UpdateQuizDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuizDto: UpdateQuizDto
  ) {
    return this.quizService.updateQuiz(id, updateQuizDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete a quiz',
    description: 'Deletes a quiz and all its associated questions.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the quiz to delete',
    example: '123e4567-e89b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'The quiz has been successfully deleted.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Quiz not found.' 
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizService.removeQuiz(id);
  }

  // Question Endpoints
  @Post(':id/questions')
  @ApiOperation({ 
    summary: 'Create a new question',
    description: 'Creates a new question that can be added to quizzes.'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The question has been created.'
  })
  @ApiBody({ type: CreateQuestionDto })
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto
  ) {
    const question = await this.quizService.createQuestion(createQuestionDto);
    return ResponseUtil.success(question, 'Question created successfully');
  }

  @Post(':id/questions/:questionId')
  @ApiOperation({ 
    summary: 'Add a question to a quiz',
    description: 'Adds an existing question to the specified quiz.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The question has been added to the quiz.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Quiz or question not found.' 
  })
  async addQuestionToQuiz(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string
  ) {
    const result = await this.quizService.addQuestionToQuiz(quizId, questionId);
    return ResponseUtil.success(result, 'Question added to quiz successfully');
  }

  @Get(':id/questions')
  @ApiOperation({ 
    summary: 'Get all questions for a quiz',
    description: 'Returns all questions for the specified quiz.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the quiz',
    example: '123e4567-e89b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully retrieved questions.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Quiz not found.' 
  })
  async getQuestions(@Param('id', ParseUUIDPipe) quizId: string) {
    const questions = await this.quizService.getQuestions(quizId);
    return ResponseUtil.success(questions, 'Questions retrieved successfully');
  }

  @Get(':id/questions/:questionId')
  @ApiOperation({ 
    summary: 'Get a specific question',
    description: 'Returns a specific question from a quiz.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the quiz',
    example: '123e4567-e89b-41d4-a716-446655440000'
  })
  @ApiParam({
    name: 'questionId',
    description: 'UUID of the question',
    example: '223e4567-e89b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Successfully retrieved the question.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Quiz or question not found.' 
  })
  async getQuestion(
    @Param('questionId', ParseUUIDPipe) questionId: string
  ) {
    const question = await this.quizService.getQuestion(questionId);
    if (!question) {
      return ResponseUtil.error('Question not found', 'QUESTION_NOT_FOUND');
    }
    return ResponseUtil.success(question, 'Question retrieved successfully');
  }

  @Put(':id/questions/:questionId')
  @ApiOperation({ 
    summary: 'Update a question',
    description: 'Updates an existing question in a quiz.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the quiz',
    example: '123e4567-e89b-41d4-a716-446655440000'
  })
  @ApiParam({
    name: 'questionId',
    description: 'UUID of the question to update',
    example: '223e4567-e89b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The question has been successfully updated.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Quiz or question not found.' 
  })
  @ApiBody({ type: UpdateQuestionDto })
  async updateQuestion(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto
  ) {
    const updated = await this.quizService.updateQuestion(questionId, updateQuestionDto);
    return ResponseUtil.success(updated, 'Question updated successfully');
  }

  @Delete(':id/questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete a question',
    description: 'Deletes a question from a quiz.'
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the quiz',
    example: '123e4567-e89b-41d4-a716-446655440000'
  })
  @ApiParam({
    name: 'questionId',
    description: 'UUID of the question to delete',
    example: '223e4567-e89b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'The question has been successfully deleted.'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Quiz or question not found.' 
  })
  async removeQuestion(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string
  ) {
    await this.quizService.removeQuestion(questionId);
    return ResponseUtil.success(null, 'Question removed from quiz successfully');
  }
}
