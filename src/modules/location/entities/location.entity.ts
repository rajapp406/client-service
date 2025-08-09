import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Location {
  @ApiProperty({ description: 'Unique identifier of the location' })
  id: string;

  @ApiProperty({ description: 'City ID (foreign key)' })
  cityId: string;

  @ApiPropertyOptional({ description: 'City information with full hierarchy' })
  city?: {
    id: string;
    name: string;
    country: {
      id: string;
      name: string;
      code: string;
    };
    State?: {
      id: string;
      name: string;
      countryId: string;
    };
  };

  @ApiPropertyOptional({ description: 'User profiles using this location', type: 'array' })
  profiles?: any[];
}