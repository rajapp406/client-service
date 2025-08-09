import { ApiProperty } from '@nestjs/swagger';

interface ISchool {
  id: string;
  name: string;
}

export class School implements ISchool {
  @ApiProperty({ description: 'Unique identifier of the school' })
  id: string;

  @ApiProperty({ example: 'Delhi Public School', description: 'Name of the school' })
  name: string;
}