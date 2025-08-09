import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class State {
  @ApiProperty({ description: 'Unique identifier of the state' })
  id: string;

  @ApiProperty({ example: 'Maharashtra', description: 'Name of the state' })
  name: string;

  @ApiProperty({ description: 'Country ID (foreign key)' })
  countryId: string;

  @ApiPropertyOptional({ description: 'Country information' })
  country?: {
    id: string;
    name: string;
    code?: string;
  };

  @ApiPropertyOptional({ description: 'Cities in this state', type: 'array' })
  cities?: any[];
}