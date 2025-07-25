import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ClientModule } from './client/client.module';
import { PrismaModule } from './prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { clientProto, PROTO_DIR } from './utils/protos';

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
  exports: [ClientModule],
})
export class AppModule {}
