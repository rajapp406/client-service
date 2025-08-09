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
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { OnboardingUserProfileDto } from './dto/onboarding-user-profile.dto';
import { UserProfile } from './entities/user-profile.entity';
import { UserType, Board } from '../../../generated/prisma';

@ApiTags('user-profiles')
@Controller('user-profiles')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user profile' })
  @ApiResponse({ status: 201, description: 'The user profile has been successfully created.', type: UserProfile })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Location or school not found.' })
  @ApiResponse({ status: 409, description: 'User profile already exists for this user.' })
  create(@Body() createUserProfileDto: CreateUserProfileDto) {
    return this.userProfileService.create(createUserProfileDto);
  }

  @Post('onboarding')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user profile through onboarding process' })
  @ApiBody({ type: OnboardingUserProfileDto })
  @ApiResponse({ status: 201, description: 'The user profile has been successfully created with interests.', type: UserProfile })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Location or school not found.' })
  @ApiResponse({ status: 409, description: 'User profile already exists for this user.' })
  onboarding(@Body() onboardingDto: OnboardingUserProfileDto) {
    return this.userProfileService.onboarding(onboardingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user profiles' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data (school, location, interests)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip number of results' })
  @ApiResponse({ status: 200, description: 'Return all user profiles.', type: [UserProfile] })
  findAll(
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.userProfileService.findAll({
      includeRelations,
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user profile statistics' })
  @ApiResponse({ status: 200, description: 'Return user profile statistics.' })
  getStatistics() {
    return this.userProfileService.getProfileStatistics();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search user profiles' })
  @ApiQuery({ name: 'userType', required: false, enum: UserType, description: 'Filter by user type' })
  @ApiQuery({ name: 'schoolId', required: false, type: String, description: 'Filter by school ID' })
  @ApiQuery({ name: 'locationId', required: false, type: String, description: 'Filter by location ID' })
  @ApiQuery({ name: 'grade', required: false, type: Number, description: 'Filter by grade' })
  @ApiQuery({ name: 'board', required: false, enum: Board, description: 'Filter by board' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by user ID, email, or phone' })
  @ApiResponse({ status: 200, description: 'Return filtered user profiles.', type: [UserProfile] })
  searchProfiles(
    @Query('userType', new ParseEnumPipe(UserType, { optional: true })) userType?: UserType,
    @Query('schoolId') schoolId?: string,
    @Query('locationId') locationId?: string,
    @Query('grade', new ParseIntPipe({ optional: true })) grade?: number,
    @Query('board', new ParseEnumPipe(Board, { optional: true })) board?: Board,
    @Query('search') search?: string,
  ) {
    return this.userProfileService.searchProfiles({
      userType,
      schoolId,
      locationId,
      grade,
      board: board as string,
      search,
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user profile by user ID' })
  @ApiParam({ name: 'userId', description: 'External user ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return the user profile.', type: UserProfile })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  findByUserId(
    @Param('userId') userId: string,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return this.userProfileService.findByUserId(userId, includeRelations);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user profile by ID' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return the user profile.', type: UserProfile })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return this.userProfileService.findOne(id, includeRelations);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiResponse({ status: 200, description: 'The user profile has been successfully updated.', type: UserProfile })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'User profile, location, or school not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.update(id, updateUserProfileDto);
  }

  @Patch('user/:userId')
  @ApiOperation({ summary: 'Update user profile by user ID' })
  @ApiParam({ name: 'userId', description: 'External user ID' })
  @ApiResponse({ status: 200, description: 'The user profile has been successfully updated.', type: UserProfile })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'User profile, location, or school not found.' })
  updateByUserId(
    @Param('userId') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateByUserId(userId, updateUserProfileDto);
  }

  @Post(':id/interests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add interest to user profile' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiBody({ schema: { type: 'object', properties: { interest: { type: 'string', example: 'Mathematics' } } } })
  @ApiResponse({ status: 200, description: 'Interest has been successfully added.' })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  @ApiResponse({ status: 409, description: 'Interest already exists for this profile.' })
  addInterest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('interest') interest: string,
  ) {
    return this.userProfileService.addInterest(id, interest);
  }

  @Delete(':id/interests/:interest')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove interest from user profile' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiParam({ name: 'interest', description: 'Interest to remove' })
  @ApiResponse({ status: 204, description: 'Interest has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'User profile or interest not found.' })
  removeInterest(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('interest') interest: string,
  ) {
    return this.userProfileService.removeInterest(id, interest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user profile' })
  @ApiParam({ name: 'id', description: 'User profile ID' })
  @ApiResponse({ status: 204, description: 'The user profile has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userProfileService.remove(id);
  }

  @Delete('user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user profile by user ID' })
  @ApiParam({ name: 'userId', description: 'External user ID' })
  @ApiResponse({ status: 204, description: 'The user profile has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  removeByUserId(@Param('userId') userId: string) {
    return this.userProfileService.removeByUserId(userId);
  }
}