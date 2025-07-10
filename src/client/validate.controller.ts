import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ClientService } from './validate.service';
import { UserResponse } from './interfaces/user.interface';

interface FetchUserRequest {
  userId: string;
}

@Controller()
export class ValidateController {
  constructor(private readonly validateService: ClientService) {}

  @GrpcMethod('ClientService', 'fetchUser')
  async fetchUser(data: FetchUserRequest): Promise<UserResponse> {
    return this.validateService.fetchUser(data.userId);
  }
}
