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
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './entities/school.entity';

@ApiTags('schools')
@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new school' })
  @ApiResponse({ status: 201, description: 'The school has been successfully created.', type: School })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'School with this name already exists.' })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schools with optional filtering' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'cityId', required: false, type: String, description: 'Filter by cityId (via branches)' })
  @ApiResponse({ status: 200, description: 'Return all schools.', type: [School] })
  findAll(
    @Query('search') search?: string,
    @Query('cityId') cityId?: string,
  ) {
    if (search || cityId) {
      return this.schoolService.searchSchools({ search, cityId });
    }
    return this.schoolService.findAll({});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a school by ID' })
  @ApiParam({ name: 'id', description: 'School ID' })
  @ApiResponse({ status: 200, description: 'Return the school.', type: School })
  @ApiResponse({ status: 404, description: 'School not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schoolService.findOne(id);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Get school with leaderboard' })
  @ApiParam({ name: 'id', description: 'School ID' })
  @ApiResponse({ status: 200, description: 'Return the school with leaderboard.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  getSchoolWithLeaderboard(@Param('id', ParseUUIDPipe) id: string) {
    return this.schoolService.getSchoolWithLeaderboard(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a school' })
  @ApiParam({ name: 'id', description: 'School ID' })
  @ApiResponse({ status: 200, description: 'The school has been successfully updated.', type: School })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiResponse({ status: 409, description: 'Another school with the same name already exists.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a school' })
  @ApiParam({ name: 'id', description: 'School ID' })
  @ApiResponse({ status: 204, description: 'The school has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.schoolService.remove(id);
  }
}