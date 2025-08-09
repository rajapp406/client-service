import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  ParseBoolPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAnswerService } from './quiz-answer.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quiz-attempt.dto';
import { CompleteQuizAttemptDto } from './dto/complete-quiz-attempt.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { BulkSubmitAnswersDto } from './dto/bulk-submit-answers.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { AttemptStatus } from '../../../generated/prisma';
import { ResponseUtil } from '../../common/utils/response.util';

@ApiTags('quiz-attempts')
@Controller('quiz-attempts')
export class QuizAttemptController {
  constructor(
    private readonly quizAttemptService: QuizAttemptService,
    private readonly quizAnswerService: QuizAnswerService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new quiz attempt' })
  @ApiResponse({ status: 201, description: 'The quiz attempt has been successfully created.', type: QuizAttempt })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Quiz or student not found.' })
  @ApiResponse({ status: 409, description: 'Student already has an active attempt for this quiz.' })
  async create(@Body() createQuizAttemptDto: CreateQuizAttemptDto) {
    const attempt = await this.quizAttemptService.create(createQuizAttemptDto);
    console.log(attempt, 'attemptgggg')
    return ResponseUtil.success(attempt);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quiz attempts' })
  @ApiQuery({ name: 'includeQuiz', required: false, type: Boolean, description: 'Include quiz information' })
  @ApiQuery({ name: 'includeStudent', required: false, type: Boolean, description: 'Include student information' })
  @ApiQuery({ name: 'includeAnswers', required: false, type: Boolean, description: 'Include answers' })
  @ApiResponse({ status: 200, description: 'Return all quiz attempts.', type: [QuizAttempt] })
  async findAll(
    @Query('includeQuiz', new ParseBoolPipe({ optional: true })) includeQuiz?: boolean,
    @Query('includeStudent', new ParseBoolPipe({ optional: true })) includeStudent?: boolean,
    @Query('includeAnswers', new ParseBoolPipe({ optional: true })) includeAnswers?: boolean,
  ) {
    return ResponseUtil.success(await this.quizAttemptService.findAll({
      includeQuiz,
      includeStudent,
      includeAnswers,
      orderBy: { startedAt: 'desc' },
    }));
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get quiz attempt statistics' })
  @ApiQuery({ name: 'quizId', required: false, type: String, description: 'Filter by quiz ID' })
  @ApiQuery({ name: 'studentId', required: false, type: String, description: 'Filter by student ID' })
  @ApiResponse({ status: 200, description: 'Return quiz attempt statistics.' })
  async getStatistics(
    @Query('quizId') quizId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return    ResponseUtil.success(await this.quizAttemptService.getAttemptStatistics(quizId, studentId));
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get quiz attempts by status' })
  @ApiParam({ name: 'status', enum: AttemptStatus, description: 'Attempt status' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return quiz attempts by status.', type: [QuizAttempt] })
  async getAttemptsByStatus(
    @Param('status', new ParseEnumPipe(AttemptStatus)) status: AttemptStatus,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return ResponseUtil.success(await this.quizAttemptService.getAttemptsByStatus(status, includeRelations));
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'Get quiz attempts for a specific quiz' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return quiz attempts for the quiz.', type: [QuizAttempt] })
  @ApiResponse({ status: 404, description: 'Quiz not found.' })
  async getAttemptsByQuiz(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return ResponseUtil.success(await this.quizAttemptService.getAttemptsByQuiz(quizId, includeRelations));
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get quiz attempts for a specific student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return quiz attempts for the student.', type: [QuizAttempt] })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async getAttemptsByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return ResponseUtil.success(await this.quizAttemptService.getAttemptsByStudent(studentId, includeRelations));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz attempt by ID' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return the quiz attempt.', type: QuizAttempt })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return ResponseUtil.success(await this.quizAttemptService.findOne(id, includeRelations));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 200, description: 'The quiz attempt has been successfully updated.', type: QuizAttempt })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt, quiz, or student not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuizAttemptDto: UpdateQuizAttemptDto,
  ) {
    return ResponseUtil.success(await this.quizAttemptService.update(id, updateQuizAttemptDto));
  }
 
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 200, description: 'The quiz attempt has been successfully completed.', type: QuizAttempt })
  @ApiResponse({ status: 400, description: 'Quiz attempt is not in progress.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeQuizAttemptDto: CompleteQuizAttemptDto,
  ) {
    return ResponseUtil.success(await this.quizAttemptService.complete(id, completeQuizAttemptDto));
  }

  @Post(':id/abandon')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Abandon a quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 200, description: 'The quiz attempt has been successfully abandoned.', type: QuizAttempt })
  @ApiResponse({ status: 400, description: 'Quiz attempt is not in progress.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async abandon(@Param('id', ParseUUIDPipe) id: string) {
    return ResponseUtil.success(await this.quizAttemptService.abandon(id));
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause a quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 200, description: 'The quiz attempt has been successfully paused.', type: QuizAttempt })
  @ApiResponse({ status: 400, description: 'Quiz attempt is not in progress.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async pause(@Param('id', ParseUUIDPipe) id: string) {
    return ResponseUtil.success(await this.quizAttemptService.pause(id));
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume a paused quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 200, description: 'The quiz attempt has been successfully resumed.', type: QuizAttempt })
  @ApiResponse({ status: 400, description: 'Quiz attempt is not paused.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async resume(@Param('id', ParseUUIDPipe) id: string) {
    return ResponseUtil.success(await this.quizAttemptService.resume(id));
  }

  @Post('submit-answer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an answer for a quiz question' })
  @ApiResponse({ status: 201, description: 'The answer has been successfully submitted.' })
  @ApiResponse({ status: 400, description: 'Bad request or quiz attempt not in progress.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt or question not found.' })
  async submitAnswer(@Body() submitAnswerDto: SubmitAnswerDto) {
    return ResponseUtil.success(await this.quizAnswerService.submitAnswer(submitAnswerDto));
  }

  @Post(':id/submit-answers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit multiple answers for a quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 201, description: 'The answers have been successfully submitted.' })
  @ApiResponse({ status: 400, description: 'Bad request or quiz attempt not in progress.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async bulkSubmitAnswers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bulkSubmitAnswersDto: BulkSubmitAnswersDto,
  ) {
    const results = await this.quizAnswerService.bulkSubmitAnswers(id, bulkSubmitAnswersDto);
    return ResponseUtil.success(results, 'Answers submitted successfully');
  }

  @Get(':id/answers')
  @ApiOperation({ summary: 'Get all answers for a quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 200, description: 'Return all answers for the quiz attempt.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async getAnswers(@Param('id', ParseUUIDPipe) id: string) {
    return ResponseUtil.success(await this.quizAnswerService.getAnswersForAttempt(id));
  }

  @Get(':id/score')
  @ApiOperation({ summary: 'Calculate current score for a quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 200, description: 'Return the calculated score.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async calculateScore(@Param('id', ParseUUIDPipe) id: string) {
    return ResponseUtil.success(await this.quizAnswerService.calculateQuizScore(id));
  }

  @Post(':id/auto-complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auto-complete a quiz attempt with current answers' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 200, description: 'The quiz attempt has been auto-completed.', type: QuizAttempt })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async autoComplete(@Param('id', ParseUUIDPipe) id: string) {
    return ResponseUtil.success(await this.quizAnswerService.autoCompleteQuiz(id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz attempt ID' })
  @ApiResponse({ status: 204, description: 'The quiz attempt has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return ResponseUtil.success(await this.quizAttemptService.remove(id));
  }
}