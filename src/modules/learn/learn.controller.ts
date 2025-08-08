import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  ParseUUIDPipe, 
  HttpStatus, 
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody, 
  ApiOkResponse, 
  ApiNotFoundResponse, 
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiConflictResponse
} from '@nestjs/swagger';
import { LearnService } from './learn.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Board } from '../../../generated/prisma';

@ApiTags('Learn')
@Controller('learn')
@UseInterceptors(ClassSerializerInterceptor)
export class LearnController {
  constructor(private readonly learnService: LearnService) {}

  /**
   * Get all subjects with optional filtering
   */
  @Get('subjects')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all subjects',
    description: 'Retrieves a list of subjects with optional filtering by grade, board, or search term.'
  })
  @ApiQuery({
    name: 'grade',
    required: false,
    type: Number,
    description: 'Filter subjects by grade'
  })
  @ApiQuery({
    name: 'board',
    required: false,
    enum: Board,
    description: 'Filter subjects by education board'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter subjects by name or description'
  })
  @ApiOkResponse({
    description: 'Successfully retrieved list of subjects',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Mathematics',
          grade: 10,
          board: 'CBSE',
          description: 'Mathematics for grade 10',
          iconUrl: 'https://example.com/math-icon.png',
          chapters: [],
          _count: {
            chapters: 0,
            questions: 0
          }
        }
      ]
    }
  })
  async getAllSubjects(
    @Query('grade') grade?: number,
    @Query('board') board?: Board,
    @Query('search') search?: string
  ) {
    return this.learnService.getAllSubjects({
      grade: grade ? Number(grade) : undefined,
      board,
      search
    });
  }

  /**
   * Get a single subject by ID
   */
  @Get('subjects/:id')
  @ApiOperation({
    summary: 'Get subject by ID',
    description: 'Retrieves detailed information about a specific subject including its chapters and question counts.'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the subject to retrieve',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the subject',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Mathematics',
        grade: 10,
        board: 'CBSE',
        description: 'Mathematics for grade 10',
        iconUrl: 'https://example.com/math-icon.png',
        chapters: [
          {
            id: '660e8400-e29b-41d4-a716-446655440001',
            name: 'Algebra',
            order: 1,
            _count: { questions: 15 }
          }
        ],
        _count: {
          chapters: 1,
          questions: 15
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Subject with the specified ID was not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subject with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: 'Not Found'
      }
    }
  })
  async getSubjectById(@Param('id', ParseUUIDPipe) id: string) {
    return this.learnService.getSubjectById(id);
  }

  /**
   * Create a new subject
   */
  @Post('subjects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new subject',
    description: 'Creates a new subject with the provided details. Subject names must be unique per grade and board.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The subject has been successfully created.'
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or missing required fields.'
  })
  @ApiConflictResponse({
    description: 'A subject with the same name, grade, and board already exists.'
  })
  @ApiBody({
    type: CreateSubjectDto,
    description: 'Subject data to create',
    examples: {
      basic: {
        summary: 'Basic subject',
        value: {
          name: 'Mathematics',
          description: 'Mathematics for grade 10',
          grade: 10,
          board: Board.CBSE,
          iconUrl: 'https://example.com/math-icon.png'
        }
      }
    }
  })
  async createSubject(@Body() dto: CreateSubjectDto) {
    return this.learnService.createSubject(dto);
  }

  /**
   * Update a subject
   */
  @Put('subjects/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a subject',
    description: 'Updates the details of an existing subject. Subject names must remain unique per grade and board.'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the subject to update',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiOkResponse({
    description: 'Successfully updated the subject',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Advanced Mathematics',
        grade: 10,
        board: 'CBSE',
        description: 'Updated description',
        iconUrl: 'https://example.com/updated-icon.png',
        chapters: [],
        _count: {
          chapters: 0,
          questions: 0
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Subject with the specified ID was not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subject with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: 'Not Found'
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or missing required fields.'
  })
  @ApiConflictResponse({
    description: 'A subject with the same name, grade, and board already exists.'
  })
  @ApiBody({
    type: UpdateSubjectDto,
    description: 'Subject data to update',
    examples: {
      basic: {
        summary: 'Update subject details',
        value: {
          name: 'Advanced Mathematics',
          description: 'Updated description',
          grade: 11,
          board: 'ICSE',
          iconUrl: 'https://example.com/updated-icon.png'
        }
      }
    }
  })
  async updateSubject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubjectDto
  ) {
    return this.learnService.updateSubject(id, dto);
  }

  /**
   * Delete a subject and its related data
   */
  @Delete('subjects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a subject',
    description: 'Deletes a subject and all its associated chapters and questions.'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the subject to delete',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiNoContentResponse({
    description: 'The subject has been successfully deleted.'
  })
  @ApiNotFoundResponse({
    description: 'Subject with the specified ID was not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Subject with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: 'Not Found'
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.'
  })
  async deleteSubject(@Param('id', ParseUUIDPipe) id: string) {
    return this.learnService.deleteSubject(id);
  }

  /**
   * Seed sample subjects (for development/testing)
   */
  @Post('seed-subjects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Seed sample subjects',
    description: 'Seeds the database with sample subject data for testing and development purposes. This endpoint is only available in development and test environments.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully seeded sample subjects.',
    schema: {
      example: {
        success: true,
        message: 'Successfully seeded 5 sample subjects',
        count: 5
      }
    }
  })
  @ApiConflictResponse({
    description: 'Sample data already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Sample data already exists. Use force=true to force reseed.',
        error: 'Conflict'
      }
    }
  })
  @ApiQuery({
    name: 'force',
    required: false,
    type: Boolean,
    description: 'Force reseed even if sample data already exists',
    example: false
  })
  async seedSubjects(@Query('force') force: boolean = false) {
    return this.learnService.seedSubjects();
  }
}
