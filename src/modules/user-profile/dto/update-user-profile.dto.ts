import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserProfileDto } from './create-user-profile.dto';

// Omit userId from update DTO since it shouldn't be changed after creation
export class UpdateUserProfileDto extends PartialType(
  OmitType(CreateUserProfileDto, ['userId'] as const)
) {}