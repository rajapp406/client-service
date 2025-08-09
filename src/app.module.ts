import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LearnModule } from './modules/learn/learn.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { SubjectModule } from './modules/subject/subject.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { PrismaModule } from './prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { clientProto, PROTO_DIR } from './utils/protos';
import { QuestionModule } from './modules/question/question.module';
import { SchoolModule } from './modules/school/school.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { QuizAttemptModule } from './modules/quiz-attempt/quiz-attempt.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { LocationModule } from './modules/location/location.module';

@Module({
  imports: [
    // Initialize Prisma as a global module
    PrismaModule.forRoot({ isGlobal: true }),
    
    // Feature modules
    LearnModule,
    QuizModule,
    SubjectModule,
    ChapterModule,
    QuestionModule,
    SchoolModule,
    LeaderboardModule,
    QuizAttemptModule,
    UserProfileModule,
    LocationModule,
    // gRPC client configuration
    ClientsModule.register([
      {
        name: 'CLIENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'client',
          protoPath: clientProto,
          url: '0.0.0.0:50522',
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [PROTO_DIR],
          },
        },
      },
    ]),
    
    // HTTP client module
    HttpModule,
  ],
  exports: [LearnModule],
})
export class AppModule {}
