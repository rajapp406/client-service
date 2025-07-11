import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  NotFoundException 
} from '@nestjs/common';
import { 
  GrpcMethod,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { ClientService } from './client.service';
import { 
  UserResponse, 
  CreateUserDto 
} from './interfaces/user.interface';

interface FetchUserRequest {
  userId: string;
}

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'The user has been successfully found.', type: UserResponse })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.clientService.fetchUser(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The user has been successfully created.',
    type: UserResponse
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.clientService.createUser(createUserDto);
  }

  // gRPC method (kept for backward compatibility)
  @GrpcMethod('ClientService', 'fetchUser')
  async fetchUserGrpc(@Payload() data: FetchUserRequest): Promise<UserResponse> {
    return this.clientService.fetchUser(data.userId);
  }
}
