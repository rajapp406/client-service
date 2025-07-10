import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';

@Module({
  imports: [
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
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class AppModule {}
