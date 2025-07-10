import { Module } from '@nestjs/common';
import { ValidateController } from './client/validate.controller';
import { ClientService } from './client/validate.service';

@Module({
  imports: [],
  controllers: [ValidateController],
  providers: [ClientService],
})
export class AppModule {}
