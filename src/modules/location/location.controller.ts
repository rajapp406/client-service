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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { Location } from './entities/location.entity';

@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // ==================== STATISTICS ====================

  @Get('statistics')
  @ApiOperation({ summary: 'Get location statistics' })
  @ApiResponse({ status: 200, description: 'Return location statistics.' })
  getStatistics() {
    return this.locationService.getLocationStatistics();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search locations by city, state, or country name' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Return search results.' })
  searchLocations(@Query('q') query: string) {
    return this.locationService.searchLocations(query);
  }

  // ==================== COUNTRY ENDPOINTS ====================

  @Post('countries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new country' })
  @ApiResponse({ status: 201, description: 'The country has been successfully created.', type: Country })
  @ApiResponse({ status: 409, description: 'Country with this name already exists.' })
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationService.createCountry(createCountryDto);
  }

  @Get('countries')
  @ApiOperation({ summary: 'Get all countries' })
  @ApiQuery({ name: 'includeStates', required: false, type: Boolean, description: 'Include states in response' })
  @ApiResponse({ status: 200, description: 'Return all countries.', type: [Country] })
  findAllCountries(@Query('includeStates', new ParseBoolPipe({ optional: true })) includeStates?: boolean) {
    return this.locationService.findAllCountries(includeStates);
  }

  @Get('countries/:id')
  @ApiOperation({ summary: 'Get a country by ID' })
  @ApiParam({ name: 'id', description: 'Country ID' })
  @ApiQuery({ name: 'includeStates', required: false, type: Boolean, description: 'Include states in response' })
  @ApiResponse({ status: 200, description: 'Return the country.', type: Country })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  findCountryById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeStates', new ParseBoolPipe({ optional: true })) includeStates?: boolean,
  ) {
    return this.locationService.findCountryById(id, includeStates);
  }

  @Patch('countries/:id')
  @ApiOperation({ summary: 'Update a country' })
  @ApiParam({ name: 'id', description: 'Country ID' })
  @ApiResponse({ status: 200, description: 'The country has been successfully updated.', type: Country })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  @ApiResponse({ status: 409, description: 'Another country with this name already exists.' })
  updateCountry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.locationService.updateCountry(id, updateCountryDto);
  }

  @Delete('countries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a country' })
  @ApiParam({ name: 'id', description: 'Country ID' })
  @ApiResponse({ status: 204, description: 'The country has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  removeCountry(@Param('id', ParseUUIDPipe) id: string) {
    return this.locationService.removeCountry(id);
  }

  // ==================== STATE ENDPOINTS ====================

  @Post('states')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new state' })
  @ApiResponse({ status: 201, description: 'The state has been successfully created.', type: State })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  @ApiResponse({ status: 409, description: 'State with this name already exists in this country.' })
  createState(@Body() createStateDto: CreateStateDto) {
    return this.locationService.createState(createStateDto);
  }

  @Get('states')
  @ApiOperation({ summary: 'Get all states' })
  @ApiQuery({ name: 'includeCountry', required: false, type: Boolean, description: 'Include country in response' })
  @ApiQuery({ name: 'includeCities', required: false, type: Boolean, description: 'Include cities in response' })
  @ApiResponse({ status: 200, description: 'Return all states.', type: [State] })
  findAllStates(
    @Query('includeCountry', new ParseBoolPipe({ optional: true })) includeCountry?: boolean,
    @Query('includeCities', new ParseBoolPipe({ optional: true })) includeCities?: boolean,
  ) {
    return this.locationService.findAllStates(includeCountry, includeCities);
  }

  @Get('states/:id')
  @ApiOperation({ summary: 'Get a state by ID' })
  @ApiParam({ name: 'id', description: 'State ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return the state.', type: State })
  @ApiResponse({ status: 404, description: 'State not found.' })
  findStateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return this.locationService.findStateById(id, includeRelations);
  }

  @Get('countries/:countryId/states')
  @ApiOperation({ summary: 'Get states by country' })
  @ApiParam({ name: 'countryId', description: 'Country ID' })
  @ApiQuery({ name: 'includeCities', required: false, type: Boolean, description: 'Include cities in response' })
  @ApiResponse({ status: 200, description: 'Return states for the country.', type: [State] })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  findStatesByCountry(
    @Param('countryId', ParseUUIDPipe) countryId: string,
    @Query('includeCities', new ParseBoolPipe({ optional: true })) includeCities?: boolean,
  ) {
    return this.locationService.findStatesByCountry(countryId, includeCities);
  }

  @Patch('states/:id')
  @ApiOperation({ summary: 'Update a state' })
  @ApiParam({ name: 'id', description: 'State ID' })
  @ApiResponse({ status: 200, description: 'The state has been successfully updated.', type: State })
  @ApiResponse({ status: 404, description: 'State or country not found.' })
  @ApiResponse({ status: 409, description: 'Another state with this name already exists in this country.' })
  updateState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return this.locationService.updateState(id, updateStateDto);
  }

  @Delete('states/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a state' })
  @ApiParam({ name: 'id', description: 'State ID' })
  @ApiResponse({ status: 204, description: 'The state has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'State not found.' })
  removeState(@Param('id', ParseUUIDPipe) id: string) {
    return this.locationService.removeState(id);
  }

  // ==================== CITY ENDPOINTS ====================

  @Post('cities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new city' })
  @ApiResponse({ status: 201, description: 'The city has been successfully created.', type: City })
  @ApiResponse({ status: 404, description: 'State not found.' })
  @ApiResponse({ status: 409, description: 'City with this name already exists in this state.' })
  createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationService.createCity(createCityDto);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get all cities' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return all cities.', type: [City] })
  findAllCities(@Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean) {
    return this.locationService.findAllCities(includeRelations);
  }

  @Get('cities/:id')
  @ApiOperation({ summary: 'Get a city by ID' })
  @ApiParam({ name: 'id', description: 'City ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return the city.', type: City })
  @ApiResponse({ status: 404, description: 'City not found.' })
  findCityById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return this.locationService.findCityById(id, includeRelations);
  }

  @Get('states/:stateId/cities')
  @ApiOperation({ summary: 'Get cities by state' })
  @ApiParam({ name: 'stateId', description: 'State ID' })
  @ApiQuery({ name: 'includeLocations', required: false, type: Boolean, description: 'Include locations in response' })
  @ApiResponse({ status: 200, description: 'Return cities for the state.', type: [City] })
  @ApiResponse({ status: 404, description: 'State not found.' })
  findCitiesByState(
    @Param('stateId', ParseUUIDPipe) stateId: string,
    @Query('includeLocations', new ParseBoolPipe({ optional: true })) includeLocations?: boolean,
  ) {
    return this.locationService.findCitiesByState(stateId, includeLocations);
  }

  @Patch('cities/:id')
  @ApiOperation({ summary: 'Update a city' })
  @ApiParam({ name: 'id', description: 'City ID' })
  @ApiResponse({ status: 200, description: 'The city has been successfully updated.', type: City })
  @ApiResponse({ status: 404, description: 'City or state not found.' })
  @ApiResponse({ status: 409, description: 'Another city with this name already exists in this state.' })
  updateCity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.locationService.updateCity(id, updateCityDto);
  }

  @Delete('cities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a city' })
  @ApiParam({ name: 'id', description: 'City ID' })
  @ApiResponse({ status: 204, description: 'The city has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'City not found.' })
  removeCity(@Param('id', ParseUUIDPipe) id: string) {
    return this.locationService.removeCity(id);
  }

  // ==================== LOCATION ENDPOINTS ====================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'The location has been successfully created.', type: Location })
  @ApiResponse({ status: 404, description: 'City not found.' })
  createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.createLocation(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return all locations.', type: [Location] })
  findAllLocations(@Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean) {
    return this.locationService.findAllLocations(includeRelations);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean, description: 'Include related data' })
  @ApiResponse({ status: 200, description: 'Return the location.', type: Location })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  findLocationById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeRelations', new ParseBoolPipe({ optional: true })) includeRelations?: boolean,
  ) {
    return this.locationService.findLocationById(id, includeRelations);
  }

  @Get('cities/:cityId/locations')
  @ApiOperation({ summary: 'Get locations by city' })
  @ApiParam({ name: 'cityId', description: 'City ID' })
  @ApiQuery({ name: 'includeProfiles', required: false, type: Boolean, description: 'Include user profiles' })
  @ApiResponse({ status: 200, description: 'Return locations for the city.', type: [Location] })
  @ApiResponse({ status: 404, description: 'City not found.' })
  findLocationsByCity(
    @Param('cityId', ParseUUIDPipe) cityId: string,
    @Query('includeProfiles', new ParseBoolPipe({ optional: true })) includeProfiles?: boolean,
  ) {
    return this.locationService.findLocationsByCity(cityId, includeProfiles);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({ status: 200, description: 'The location has been successfully updated.', type: Location })
  @ApiResponse({ status: 404, description: 'Location or city not found.' })
  updateLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationService.updateLocation(id, updateLocationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({ status: 204, description: 'The location has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  removeLocation(@Param('id', ParseUUIDPipe) id: string) {
    return this.locationService.removeLocation(id);
  }
}