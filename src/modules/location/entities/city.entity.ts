import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class City {
  @ApiProperty({ description: 'Unique identifier of the city' })
  id: string;

  @ApiProperty({ example: 'Mumbai', description: 'Name of the city' })
  name: string;

  @ApiProperty({ description: 'State ID (foreign key)' })
  stateId: string;

  @ApiPropertyOptional({ description: 'Country info for the city' })
  country?: {
    id: string;
    name: string;
    code: string;
  };

  @ApiPropertyOptional({ description: 'State information' })
  State?: {
    id: string;
    name: string;
    countryId: string;
  };

  @ApiPropertyOptional({ description: 'Locations in this city', type: 'array' })
  locations?: any[];
}