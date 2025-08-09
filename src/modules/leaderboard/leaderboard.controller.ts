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
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import { Leaderboard } from './entities/leaderboard.entity';

@ApiTags('leaderboards')
@Controller('leaderboards')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new leaderboard entry' })
  @ApiResponse({ status: 201, description: 'The leaderboard entry has been successfully created.', type: Leaderboard })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiResponse({ status: 409, description: 'Leaderboard entry for this user and school already exists.' })
  create(@Body() createLeaderboardDto: CreateLeaderboardDto) {
    return this.leaderboardService.create(createLeaderboardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leaderboard entries' })
  @ApiQuery({ name: 'includeSchool', required: false, type: Boolean, description: 'Include school information' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiResponse({ status: 200, description: 'Return all leaderboard entries.', type: [Leaderboard] })
  findAll(
    @Query('includeSchool', new ParseBoolPipe({ optional: true })) includeSchool?: boolean,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.leaderboardService.findAll({
      includeSchool,
      take: limit,
      orderBy: { rank: 'asc' },
    });
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Get top performers across all schools' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Return top performers.', type: [Leaderboard] })
  getTopPerformers(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.leaderboardService.getTopPerformers(limit);
  }

  @Get('school/:schoolId')
  @ApiOperation({ summary: 'Get leaderboard entries for a specific school' })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results (default: 10)' })
  @ApiQuery({ name: 'includeSchool', required: false, type: Boolean, description: 'Include school information' })
  @ApiResponse({ status: 200, description: 'Return leaderboard entries for the school.', type: [Leaderboard] })
  @ApiResponse({ status: 404, description: 'School not found.' })
  getLeaderboardBySchool(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('includeSchool', new ParseBoolPipe({ optional: true })) includeSchool?: boolean,
  ) {
    return this.leaderboardService.getLeaderboardBySchool(schoolId, { limit, includeSchool });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get leaderboard entries for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'includeSchool', required: false, type: Boolean, description: 'Include school information' })
  @ApiResponse({ status: 200, description: 'Return leaderboard entries for the user.', type: [Leaderboard] })
  getLeaderboardByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('includeSchool', new ParseBoolPipe({ optional: true })) includeSchool?: boolean,
  ) {
    return this.leaderboardService.getLeaderboardByUser(userId, includeSchool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a leaderboard entry by ID' })
  @ApiParam({ name: 'id', description: 'Leaderboard entry ID' })
  @ApiQuery({ name: 'includeSchool', required: false, type: Boolean, description: 'Include school information' })
  @ApiResponse({ status: 200, description: 'Return the leaderboard entry.', type: Leaderboard })
  @ApiResponse({ status: 404, description: 'Leaderboard entry not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeSchool', new ParseBoolPipe({ optional: true })) includeSchool?: boolean,
  ) {
    return this.leaderboardService.findOne(id, includeSchool);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a leaderboard entry' })
  @ApiParam({ name: 'id', description: 'Leaderboard entry ID' })
  @ApiResponse({ status: 200, description: 'The leaderboard entry has been successfully updated.', type: Leaderboard })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Leaderboard entry or school not found.' })
  @ApiResponse({ status: 409, description: 'Another leaderboard entry for this user and school already exists.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeaderboardDto: UpdateLeaderboardDto,
  ) {
    return this.leaderboardService.update(id, updateLeaderboardDto);
  }

  @Post('school/:schoolId/update-rankings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update rankings for all users in a school based on total scores' })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiResponse({ status: 200, description: 'Rankings have been successfully updated.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  updateUserRankings(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.leaderboardService.updateUserRankings(schoolId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a leaderboard entry' })
  @ApiParam({ name: 'id', description: 'Leaderboard entry ID' })
  @ApiResponse({ status: 204, description: 'The leaderboard entry has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Leaderboard entry not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaderboardService.remove(id);
  }
}