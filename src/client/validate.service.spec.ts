import { Test, TestingModule } from '@nestjs/testing';
import { ValidateService } from './validate.service';

describe('ValidateService', () => {
  let service: ValidateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidateService],
    }).compile();

    service = module.get<ValidateService>(ValidateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchUser', () => {
    it('should return a user with the provided userId', async () => {
      const testUserId = 'test-user-123';
      const result = await service.fetchUser(testUserId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(testUserId);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.isActive).toBe(true);
    });
  });
});
