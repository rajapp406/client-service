import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { QuestionModule } from '../question/question.module';

@Module({ 
  imports: [PrismaModule, QuestionModule],
  controllers: [ChapterController],
  providers: [ChapterService],
  exports: [ChapterService],
})
export class ChapterModule {}
