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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';
import { Board } from '../../../generated/prisma';

@ApiTags('subjects')
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'The subject has been successfully created.', type: Subject })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Subject with this name, grade and board already exists.' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subjects with optional filtering' })
  @ApiQuery({ name: 'grade', required: false, type: Number, description: 'Filter by grade level' })
  @ApiQuery({ name: 'board', required: false, enum: Board, description: 'Filter by education board' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or description' })
  @ApiResponse({ status: 200, description: 'Return all subjects.', type: [Subject] })
  findAll(
    @Query('grade') grade?: number,
    @Query('board') board?: Board,
    @Query('search') search?: string,
  ) {
    if (grade || board || search) {
      return this.subjectService.searchSubjects({ grade, board, search });
    }
    return this.subjectService.findAll({});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by ID' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Return the subject.', type: Subject })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjectService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'The subject has been successfully updated.', type: Subject })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @ApiResponse({ status: 409, description: 'Another subject with the same name, grade and board already exists.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 204, description: 'The subject has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjectService.remove(id);
  }
}
