import { Global, Module, DynamicModule, Provider } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { PrismaService } from './prisma.service';

export interface PrismaModuleOptions {
  isGlobal?: boolean;
  clientOptions?: ConstructorParameters<typeof PrismaClient>[0];
}

@Global()
@Module({})
export class PrismaModule {
  static forRoot(options: PrismaModuleOptions = {}): DynamicModule {
    const prismaClientProvider: Provider = {
      provide: PrismaService,
      useFactory: (): PrismaService => {
        const prisma = new PrismaService();
        // Removed beforeExit event registration for generated Prisma client compatibility
        return prisma;
      },
    };

    return {
      global: options.isGlobal ?? true,
      module: PrismaModule,
      providers: [prismaClientProvider],
      exports: [PrismaService],
    };
  }
}
