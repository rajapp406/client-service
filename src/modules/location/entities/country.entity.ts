import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Country {
  @ApiProperty({ description: 'Unique identifier of the country' })
  id: string;

  @ApiProperty({ example: 'India', description: 'Name of the country' })
  name: string;

  @ApiPropertyOptional({ 
    example: 'IN', 
    description: 'ISO country code',
    nullable: true
  })
  code?: string | null;

  @ApiPropertyOptional({ description: 'States in this country', type: 'array' })
  states?: any[];
}