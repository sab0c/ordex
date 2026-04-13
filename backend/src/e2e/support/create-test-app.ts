import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { AdminUser } from '../../auth/entities/admin-user.entity';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { OrdersController } from '../../orders/controllers/orders.controller';
import { ORDER_REPOSITORY } from '../../orders/orders.constants';
import { OrdersService } from '../../orders/services/orders.service';
import { InMemoryOrderRepository } from './in-memory-order.repository';

export type TestAppContext = {
  adminUsersRepository: {
    findOne: jest.Mock;
  };
  app: INestApplication;
  orderRepository: InMemoryOrderRepository;
  resetState: () => void;
};

export async function createTestApp(): Promise<TestAppContext> {
  const orderRepository = new InMemoryOrderRepository();
  const passwordHash = await hash('admin', 10);
  const adminUsersRepository = {
    findOne: jest.fn(),
  };

  function resetState(): void {
    orderRepository.reset();
    adminUsersRepository.findOne.mockReset();
    adminUsersRepository.findOne.mockImplementation(
      ({
        where,
      }: {
        where: {
          username: string;
        };
      }) => {
        if (where.username !== 'admin') {
          return Promise.resolve(null);
        }

        return Promise.resolve({
          id: 1,
          username: 'admin',
          passwordHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        } satisfies AdminUser);
      },
    );
  }

  resetState();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      PassportModule,
      JwtModule.register({
        secret: 'test-secret',
        signOptions: {
          expiresIn: '1h',
        },
      }),
    ],
    controllers: [AuthController, OrdersController],
    providers: [
      AuthService,
      OrdersService,
      JwtStrategy,
      {
        provide: getRepositoryToken(AdminUser),
        useValue: adminUsersRepository,
      },
      {
        provide: ConfigService,
        useValue: {
          getOrThrow: () => 'test-secret',
        },
      },
      {
        provide: ORDER_REPOSITORY,
        useValue: orderRepository,
      },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  return {
    adminUsersRepository,
    app,
    orderRepository,
    resetState,
  };
}
