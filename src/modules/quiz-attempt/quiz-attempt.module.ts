import { Module } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { QuizAnswerService } from './quiz-answer.service';
import { QuizAttemptController } from './quiz-attempt.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuizAttemptController],
  providers: [QuizAttemptService, QuizAnswerService],
  exports: [QuizAttemptService, QuizAnswerService],
})
export class QuizAttemptModule {}