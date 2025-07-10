import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserResponse } from './interfaces/user.interface';

@Injectable()
export class ClientService {
  async fetchUser(userId: string): Promise<UserResponse> {
    // Return a dummy user response
    return {
      id: userId,
      name: 'John Doe23',
      email: 'john.doe@example.com',
      isActive: true,
    };
  }
}
