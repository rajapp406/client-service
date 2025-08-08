import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { clientProto } from './utils/protos';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // Create HTTP server
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS with specific origins
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8080'], // Add your UI's origin(s) here
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    
    // Enable validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Initialize Prisma
    const prismaService = app.get(PrismaService);
    await prismaService.enableShutdownHooks(app);
    
    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Learn Service API')
      .setDescription('API documentation for the Learn Service')
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
    const httpPort = process.env.HTTP_PORT || 3100;
    await app.listen(httpPort);
    logger.log(`HTTP server running on port ${httpPort}`);
    logger.log(`Swagger UI available at http://localhost:${httpPort}/api`);

    // Start gRPC microservice
    const grpcHost = process.env.GRPC_HOST || '0.0.0.0';
    const grpcPort = process.env.GRPC_PORT || '50511';
    const grpcUrl = `${grpcHost}:${grpcPort}`;
    
    const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.GRPC,
        options: {
          url: grpcUrl,
          package: 'client',
          protoPath: clientProto,
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
          channelOptions: {
            'grpc.keepalive_time_ms': 10000,
            'grpc.keepalive_timeout_ms': 5000,
            'grpc.keepalive_permit_without_calls': 1,
            'grpc.http2_max_pings_without_data': 0,
            'grpc.max_send_message_length': 1024 * 1024 * 50,
            'grpc.max_receive_message_length': 1024 * 1024 * 50,
          },
        },
      },
    );

    await grpcApp.listen();
    logger.log(`gRPC server running on ${grpcUrl}`);
    
  } catch (error) {
    logger.error('Error during application startup', error);
    process.exit(1);
  }
}

bootstrap();
