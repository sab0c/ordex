import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { normalizeTextForSearch } from '../common/utils/text-normalization.util';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { OrderSortBy, SortOrder } from '../orders/dto/list-orders-query.dto';
import { UpdateOrderDto } from '../orders/dto/update-order.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { OrdersController } from '../orders/controllers/orders.controller';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { ORDER_REPOSITORY } from '../orders/orders.constants';
import {
  CreateOrderRepositoryData,
  ListOrdersRepositoryFilters,
  ListOrdersRepositoryResult,
  OrderRepository,
} from '../orders/repositories/order.repository';
import { OrdersService } from '../orders/services/orders.service';

class InMemoryOrderRepository implements OrderRepository {
  private currentId = 1;
  private orders: Order[] = [];

  create(data: CreateOrderRepositoryData): Promise<Order> {
    const now = new Date();
    const order: Order = {
      id: this.currentId++,
      cliente: data.cliente,
      descricao: data.descricao,
      valor_estimado: data.valor_estimado,
      status: data.status,
      data_criacao: now,
      data_atualizacao: now,
    };

    this.orders.push(order);

    return Promise.resolve({ ...order });
  }

  findAll(
    filters: ListOrdersRepositoryFilters,
  ): Promise<ListOrdersRepositoryResult> {
    const filteredOrders = [...this.orders]
      .filter((order) =>
        filters.cliente === undefined
          ? true
          : normalizeTextForSearch(order.cliente).includes(
              normalizeTextForSearch(filters.cliente),
            ),
      )
      .filter((order) =>
        filters.status === undefined ? true : order.status === filters.status,
      )
      .sort((firstOrder, secondOrder) => {
        if (filters.sortBy === OrderSortBy.VALOR_ESTIMADO) {
          const firstValue = Number(firstOrder.valor_estimado);
          const secondValue = Number(secondOrder.valor_estimado);

          return filters.sortOrder === SortOrder.ASC
            ? firstValue - secondValue
            : secondValue - firstValue;
        }

        const firstValue = firstOrder.data_criacao.getTime();
        const secondValue = secondOrder.data_criacao.getTime();

        return filters.sortOrder === SortOrder.ASC
          ? firstValue - secondValue
          : secondValue - firstValue;
      });

    const total = filteredOrders.length;
    const startIndex = (filters.page - 1) * filters.limit;
    const data = filteredOrders.slice(startIndex, startIndex + filters.limit);

    return Promise.resolve({
      data: data.map((order) => ({ ...order })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit),
      },
    });
  }

  findById(id: number): Promise<Order | null> {
    const order = this.orders.find((currentOrder) => currentOrder.id === id);

    return Promise.resolve(order ? { ...order } : null);
  }

  save(order: Order): Promise<Order> {
    const index = this.orders.findIndex(
      (currentOrder) => currentOrder.id === order.id,
    );

    const updatedOrder = {
      ...order,
      data_atualizacao: new Date(),
    };

    this.orders[index] = updatedOrder;

    return Promise.resolve({ ...updatedOrder });
  }
}

type LoginResponse = {
  access_token: string;
};

type OrderResponse = {
  id: number;
  cliente: string;
  descricao: string;
  valor_estimado: string;
  status: OrderStatus;
};

type ListOrdersResponse = {
  data: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

describe('Orders E2E', () => {
  let app: INestApplication;
  let orderRepository: InMemoryOrderRepository;
  const adminUsersRepository = {
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    orderRepository = new InMemoryOrderRepository();
    const passwordHash = await hash('admin', 10);

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

    app = moduleFixture.createNestApplication();
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
  });

  afterAll(async () => {
    await app.close();
  });

  function getHttpServer(): Parameters<typeof request>[0] {
    return app.getHttpServer() as Parameters<typeof request>[0];
  }

  async function login(): Promise<string> {
    const response = await request(getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin',
      } satisfies LoginDto)
      .expect(201);

    return (response.body as LoginResponse).access_token;
  }

  it('should authenticate the seeded admin user', async () => {
    const response = await request(getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin',
      } satisfies LoginDto)
      .expect(201);

    expect((response.body as LoginResponse).access_token).toEqual(
      expect.any(String),
    );
  });

  it('should require JWT to access orders routes', async () => {
    await request(getHttpServer()).get('/orders').expect(401);
  });

  it('should list orders with filters, sorting and pagination', async () => {
    const token = await login();
    const authHeader = { Authorization: `Bearer ${token}` };

    const orderPayloads: CreateOrderDto[] = [
      {
        cliente: 'Maria Oliveira',
        descricao: 'Troca de tela',
        valor_estimado: 500,
        status: OrderStatus.ABERTA,
      },
      {
        cliente: 'Maria Oliveira',
        descricao: 'Troca de bateria',
        valor_estimado: 150,
        status: OrderStatus.EM_ANDAMENTO,
      },
      {
        cliente: 'Carlos Souza',
        descricao: 'Limpeza interna',
        valor_estimado: 200,
        status: OrderStatus.EM_ANDAMENTO,
      },
      {
        cliente: 'Letícia Ramos',
        descricao: 'Ajuste de dobradiça',
        valor_estimado: 250,
        status: OrderStatus.ABERTA,
      },
    ];

    for (const payload of orderPayloads) {
      await request(getHttpServer())
        .post('/orders')
        .set(authHeader)
        .send(payload)
        .expect(201);
    }

    const response = await request(getHttpServer())
      .get('/orders')
      .set(authHeader)
      .query({
        cliente: 'Maria',
        status: OrderStatus.EM_ANDAMENTO,
        sort_by: OrderSortBy.VALOR_ESTIMADO,
        sort_order: SortOrder.ASC,
        page: 1,
        limit: 1,
      })
      .expect(200);

    const responseBody = response.body as ListOrdersResponse;

    expect(responseBody.data).toHaveLength(1);
    expect(responseBody.data[0]?.cliente).toBe('Maria Oliveira');
    expect(responseBody.data[0]?.status).toBe(OrderStatus.EM_ANDAMENTO);
    expect(responseBody.data[0]?.valor_estimado).toBe('150.00');
    expect(responseBody.pagination).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('should filter client names ignoring accents', async () => {
    const token = await login();
    const authHeader = { Authorization: `Bearer ${token}` };

    await request(getHttpServer())
      .post('/orders')
      .set(authHeader)
      .send({
        cliente: 'Letícia Ramos',
        descricao: 'Ajuste fino',
        valor_estimado: 180,
        status: OrderStatus.ABERTA,
      } satisfies CreateOrderDto)
      .expect(201);

    const response = await request(getHttpServer())
      .get('/orders')
      .set(authHeader)
      .query({
        cliente: 'leticia',
        page: 1,
        limit: 10,
      })
      .expect(200);

    const responseBody = response.body as ListOrdersResponse;

    expect(responseBody.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cliente: 'Letícia Ramos',
        }),
      ]),
    );
  });

  it('should enforce the status transition rule through HTTP', async () => {
    const token = await login();
    const authHeader = { Authorization: `Bearer ${token}` };

    const createResponse = await request(getHttpServer())
      .post('/orders')
      .set(authHeader)
      .send({
        cliente: 'Regra HTTP',
        descricao: 'Validar status',
        valor_estimado: 80,
        status: OrderStatus.ABERTA,
      } satisfies CreateOrderDto)
      .expect(201);

    const createdOrder = createResponse.body as OrderResponse;

    await request(getHttpServer())
      .patch(`/orders/${createdOrder.id}/status`)
      .set(authHeader)
      .send({
        status: OrderStatus.CONCLUIDA,
      } satisfies UpdateOrderStatusDto)
      .expect(409);

    const inProgressResponse = await request(getHttpServer())
      .patch(`/orders/${createdOrder.id}/status`)
      .set(authHeader)
      .send({
        status: OrderStatus.EM_ANDAMENTO,
      } satisfies UpdateOrderStatusDto)
      .expect(200);

    expect((inProgressResponse.body as OrderResponse).status).toBe(
      OrderStatus.EM_ANDAMENTO,
    );
  });

  it('should update order data through HTTP', async () => {
    const token = await login();
    const authHeader = { Authorization: `Bearer ${token}` };

    const createResponse = await request(getHttpServer())
      .post('/orders')
      .set(authHeader)
      .send({
        cliente: 'Atualização HTTP',
        descricao: 'Antes',
        valor_estimado: 90,
        status: OrderStatus.ABERTA,
      } satisfies CreateOrderDto)
      .expect(201);

    const createdOrder = createResponse.body as OrderResponse;

    const updateResponse = await request(getHttpServer())
      .patch(`/orders/${createdOrder.id}`)
      .set(authHeader)
      .send({
        descricao: 'Depois',
        valor_estimado: 120.5,
      } satisfies UpdateOrderDto)
      .expect(200);

    const updatedOrder = updateResponse.body as OrderResponse;

    expect(updatedOrder.descricao).toBe('Depois');
    expect(updatedOrder.valor_estimado).toBe('120.50');
  });
});
