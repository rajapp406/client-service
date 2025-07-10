import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ClientService } from './client.service';
import { UserResponse } from './interfaces/user.interface';

interface FetchUserRequest {
  userId: string;
}

@Controller()
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @GrpcMethod('ClientService', 'fetchUser')
  async fetchUser(data: FetchUserRequest): Promise<UserResponse> {
    return this.clientService.fetchUser(data.userId);
  }
}
