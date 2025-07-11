import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // Create HTTP server
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors();
    
    // Enable validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Initialize Prisma
    const prismaService = app.get(PrismaService);
    await prismaService.enableShutdownHooks(app);
    
    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Client Service API')
      .setDescription('API documentation for the Client Service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    // Start HTTP server
    const httpPort = process.env.HTTP_PORT || 3000;
    await app.listen(httpPort);
    logger.log(`HTTP server running on port ${httpPort}`);
    logger.log(`Swagger UI available at http://localhost:${httpPort}/api`);

    // Start gRPC microservice
    const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
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

    await grpcApp.listen();
    logger.log('gRPC server running on port 50522');
    
  } catch (error) {
    logger.error('Error during application startup', error);
    process.exit(1);
  }
}

bootstrap();
