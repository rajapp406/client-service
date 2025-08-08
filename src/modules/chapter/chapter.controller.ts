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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Chapter, ChapterWithRelations } from './entities/chapter.entity';
import { ResponseUtil } from '@/common/utils/response.util';

@ApiTags('chapters')
@Controller('chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiResponse({ status: 201, description: 'The chapter has been successfully created.', type: Chapter })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Related subject not found.' })
  @ApiResponse({ status: 409, description: 'Chapter number already exists for this subject.' })
  async create(@Body() createChapterDto: CreateChapterDto) {
    const chapter = await this.chapterService.create(createChapterDto);
    return ResponseUtil.success(chapter, 'Chapter created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all chapters with optional filtering' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by chapter title' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({ status: 200, description: 'Return all chapters.', type: [ChapterWithRelations] })
  async findAll(
    @Query('subjectId') subjectId?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (subjectId) where.subjectId = subjectId;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [items, total] = await this.chapterService.findAllWithCount({
      skip,
      take: limit,
      where,
      orderBy: { chapterNumber: 'asc' },
    });

    return ResponseUtil.paginated(
      items,
      total,
      page,
      limit,
      'Chapters retrieved successfully'
    );
  }

  @Get('subject/:subjectId')
  @ApiOperation({ summary: 'Get all chapters for a subject' })
  @ApiParam({ name: 'subjectId', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Return all chapters for the subject.', type: [ChapterWithRelations] })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  async findBySubject(@Param('subjectId', ParseUUIDPipe) subjectId: string) {
    const chapters = await this.chapterService.findChaptersBySubject(subjectId);
    return ResponseUtil.success(chapters, 'Chapters for subject retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chapter by ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({ status: 200, description: 'Return the chapter.', type: ChapterWithRelations })
  @ApiResponse({ status: 404, description: 'Chapter not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const chapter = await this.chapterService.findOne(id);
    if (!chapter) {
      return ResponseUtil.error('Chapter not found', 'CHAPTER_NOT_FOUND');
    }
    return ResponseUtil.success(chapter, 'Chapter retrieved successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a chapter' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({ status: 200, description: 'The chapter has been successfully updated.', type: Chapter })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Chapter or related subject not found.' })
  @ApiResponse({ status: 409, description: 'Chapter number already exists for this subject.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    const updated = await this.chapterService.update(id, updateChapterDto);
    return ResponseUtil.success(updated, 'Chapter updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a chapter' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({ status: 204, description: 'The chapter has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Cannot delete chapter with associated questions.' })
  @ApiResponse({ status: 404, description: 'Chapter not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.chapterService.remove(id);
    return ResponseUtil.success(null, 'Chapter deleted successfully');
  }
}
