import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50522',
        package: 'client',
        protoPath: join(
          __dirname,
          '../../common-modules/protocol/client.proto',
        ),
      },
    },
  );

  await app.listen();
  console.log('Validate Service is running on port 50522');
}

bootstrap();
