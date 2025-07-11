import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ClientModule } from './client/client.module';
import { PrismaModule } from './prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // Initialize Prisma as a global module
    PrismaModule.forRoot({ isGlobal: true }),
    
    // Feature modules
    ClientModule,
    
    // gRPC client configuration
    ClientsModule.register([
      {
        name: 'CLIENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'client',
          protoPath: join(__dirname, '../../common-modules/protocol/client.proto'),
          url: '0.0.0.0:50522',
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [join(__dirname, '../../common-modules/protocol')],
          },
        },
      },
    ]),
    
    // HTTP client module
    HttpModule,
  ],
  exports: [ClientModule],
})
export class AppModule {}
