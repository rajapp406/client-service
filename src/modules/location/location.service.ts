import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class LocationService {
  constructor(
    @Inject(PrismaService)
    private prisma: PrismaService,
  ) {}

  // ==================== COUNTRY OPERATIONS ====================

  async createCountry(createCountryDto: CreateCountryDto): Promise<Country> {
    const existingCountry = await this.prisma.country.findUnique({
      where: { name: createCountryDto.name },
    });

    if (existingCountry) {
      throw new ConflictException('Country with this name already exists');
    }

    const data: Prisma.CountryCreateInput = {
      name: createCountryDto.name,
      code: createCountryDto.code,
    };

    return this.prisma.country.create({ data });
  }

  async findAllCountries(includeStates = false): Promise<Country[]> {
    return this.prisma.country.findMany({
      include: includeStates ? { State: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findCountryById(id: string, includeStates = false): Promise<Country> {
    const country = await this.prisma.country.findUnique({
      where: { id },
      include: includeStates ? { State: true } : undefined,
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return country;
  }

  async updateCountry(id: string, updateCountryDto: UpdateCountryDto): Promise<Country> {
    await this.findCountryById(id);

    if (updateCountryDto.name) {
      const existingCountry = await this.prisma.country.findFirst({
        where: { name: updateCountryDto.name, id: { not: id } },
      });

      if (existingCountry) {
        throw new ConflictException('Another country with this name already exists');
      }
    }

    const data: Prisma.CountryUpdateInput = {
      name: updateCountryDto.name,
      code: updateCountryDto.code,
    };

    return this.prisma.country.update({ where: { id }, data });
  }

  async removeCountry(id: string): Promise<void> {
    await this.findCountryById(id);
    await this.prisma.country.delete({ where: { id } });
  }

  // ==================== STATE OPERATIONS ====================

  async createState(createStateDto: CreateStateDto): Promise<State> {
    await this.findCountryById(createStateDto.countryId);

    const existingState = await this.prisma.state.findFirst({
      where: { name: createStateDto.name, countryId: createStateDto.countryId },
    });

    if (existingState) {
      throw new ConflictException('State with this name already exists in this country');
    }

    const data: Prisma.StateCreateInput = {
      name: createStateDto.name,
      country: { connect: { id: createStateDto.countryId } },
    };

    return this.prisma.state.create({ data, include: { country: true } });
  }

  async findAllStates(includeCountry = false, includeCities = false): Promise<State[]> {
    return this.prisma.state.findMany({
      include: { country: includeCountry, cities: includeCities },
      orderBy: [{ country: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async findStateById(id: string, includeRelations = false): Promise<State> {
    const state = await this.prisma.state.findUnique({
      where: { id },
      include: includeRelations ? { country: true, cities: true } : undefined,
    });

    if (!state) {
      throw new NotFoundException(`State with ID ${id} not found`);
    }

    return state;
  }

  async findStatesByCountry(countryId: string, includeCities = false): Promise<State[]> {
    await this.findCountryById(countryId);

    return this.prisma.state.findMany({
      where: { countryId },
      include: { country: true, cities: includeCities },
      orderBy: { name: 'asc' },
    });
  }

  async updateState(id: string, updateStateDto: UpdateStateDto): Promise<State> {
    await this.findStateById(id);

    if (updateStateDto.countryId) {
      await this.findCountryById(updateStateDto.countryId);
    }

    if (updateStateDto.name || updateStateDto.countryId) {
      const currentState = await this.findStateById(id);
      const nameToCheck = updateStateDto.name || currentState.name;
      const countryIdToCheck = updateStateDto.countryId || currentState.countryId;

      const existingState = await this.prisma.state.findFirst({
        where: { name: nameToCheck, countryId: countryIdToCheck, id: { not: id } },
      });

      if (existingState) {
        throw new ConflictException('Another state with this name already exists in this country');
      }
    }

    const data: Prisma.StateUpdateInput = {
      name: updateStateDto.name,
      country: updateStateDto.countryId ? { connect: { id: updateStateDto.countryId } } : undefined,
    };

    return this.prisma.state.update({ where: { id }, data, include: { country: true } });
  }

  async removeState(id: string): Promise<void> {
    await this.findStateById(id);
    await this.prisma.state.delete({ where: { id } });
  }

  // ==================== CITY OPERATIONS ====================

  async createCity(createCityDto: CreateCityDto): Promise<City> {
    await this.findStateById(createCityDto.stateId);

    const existingCity = await this.prisma.city.findFirst({
      where: { name: createCityDto.name, stateId: createCityDto.stateId },
    });

    if (existingCity) {
      throw new ConflictException('City with this name already exists in this state');
    }

    const data: Prisma.CityCreateInput = {
      name: createCityDto.name,
      State: { connect: { id: createCityDto.stateId } },
      country: { connect: { id: (await this.prisma.state.findUnique({ where: { id: createCityDto.stateId } }))!.countryId } },
    } as any;

    return this.prisma.city.create({
      data,
      include: { State: true, country: true },
    });
  }

  async findAllCities(includeRelations = false): Promise<City[]> {
    return this.prisma.city.findMany({
      include: includeRelations ? { State: true, country: true, Location: true } : undefined,
      orderBy: [{ country: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async findCityById(id: string, includeRelations = false): Promise<City> {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: includeRelations ? { State: true, country: true, Location: true } : undefined,
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async findCitiesByState(stateId: string, includeLocations = false): Promise<City[]> {
    await this.findStateById(stateId);

    return this.prisma.city.findMany({
      where: { stateId },
      include: { State: true, country: true, Location: includeLocations },
      orderBy: { name: 'asc' },
    });
  }

  async updateCity(id: string, updateCityDto: UpdateCityDto): Promise<City> {
    await this.findCityById(id);

    if (updateCityDto.stateId) {
      await this.findStateById(updateCityDto.stateId);
    }

    if (updateCityDto.name || updateCityDto.stateId) {
      const currentCity = await this.findCityById(id);
      const nameToCheck = updateCityDto.name || currentCity.name;
      const stateIdToCheck = updateCityDto.stateId || currentCity.stateId!;

      const existingCity = await this.prisma.city.findFirst({
        where: { name: nameToCheck, stateId: stateIdToCheck, id: { not: id } },
      });

      if (existingCity) {
        throw new ConflictException('Another city with this name already exists in this state');
      }
    }

    const data: Prisma.CityUpdateInput = {
      name: updateCityDto.name,
      State: updateCityDto.stateId ? { connect: { id: updateCityDto.stateId } } : undefined,
    };

    return this.prisma.city.update({ where: { id }, data, include: { State: true, country: true } });
  }

  async removeCity(id: string): Promise<void> {
    await this.findCityById(id);
    await this.prisma.city.delete({ where: { id } });
  }

  // ==================== LOCATION OPERATIONS ====================

  async createLocation(createLocationDto: CreateLocationDto): Promise<Location> {
    await this.findCityById(createLocationDto.cityId);

    return this.prisma.location.create({
      data: { city: { connect: { id: createLocationDto.cityId } } },
      include: {
        city: {
          include: {
            country: true,
            State: true,
          },
        },
      },
    }) as unknown as Location;
  }

  async findAllLocations(includeRelations = false): Promise<Location[]> {
    return this.prisma.location.findMany({
      include: includeRelations ? {
        city: { include: { country: true, State: true } },
      } : undefined,
      orderBy: { city: { country: { name: 'asc' } } },
    }) as unknown as Location[];
  }

  async findLocationById(id: string, includeRelations = false): Promise<Location> {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: includeRelations ? {
        city: { include: { country: true, State: true } },
      } : undefined,
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location as unknown as Location;
  }

  async findLocationsByCity(cityId: string, includeProfiles = false): Promise<Location[]> {
    await this.findCityById(cityId);

    return this.prisma.location.findMany({
      where: { cityId },
      include: {
        city: { include: { country: true, State: true } },
      },
    }) as unknown as Location[];
  }

  async updateLocation(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    await this.findLocationById(id);

    if (updateLocationDto.cityId) {
      await this.findCityById(updateLocationDto.cityId);
    }

    const data: Prisma.LocationUpdateInput = {
      city: updateLocationDto.cityId ? { connect: { id: updateLocationDto.cityId } } : undefined,
    };

    return this.prisma.location.update({
      where: { id },
      data,
      include: { city: { include: { country: true, State: true } } },
    }) as unknown as Location;
  }

  async removeLocation(id: string): Promise<void> {
    await this.findLocationById(id);
    await this.prisma.location.delete({ where: { id } });
  }

  // ==================== SEARCH OPERATIONS ====================

  async searchLocations(query: string): Promise<any[]> {
    const results = await this.prisma.location.findMany({
      where: {
        OR: [
          { city: { name: { contains: query, mode: 'insensitive' } } },
          { city: { State: { name: { contains: query, mode: 'insensitive' } } } },
          { city: { country: { name: { contains: query, mode: 'insensitive' } } } },
        ],
      },
      include: { city: { include: { country: true, State: true } } },
      take: 50,
    });

    return results;
  }

  // ==================== STATISTICS ====================

  async getLocationStatistics(): Promise<any> {
    const [countryCount, stateCount, cityCount, locationCount] = await Promise.all([
      this.prisma.country.count(),
      this.prisma.state.count(),
      this.prisma.city.count(),
      this.prisma.location.count(),
    ]);

    return {
      countries: countryCount,
      states: stateCount,
      cities: cityCount,
      locations: locationCount,
    };
  }
}