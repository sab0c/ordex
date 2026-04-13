import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { LoginDto } from '../auth/dto/login.dto';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { OrderSortBy, SortOrder } from '../orders/dto/list-orders-query.dto';
import { UpdateOrderDto } from '../orders/dto/update-order.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { createAndAuthenticateAdmin } from './helpers/create-and-authenticate-admin';
import { OrderHttpResponse } from './helpers/create-order-through-http';
import { createTestApp } from './support/create-test-app';

type LoginResponse = {
  access_token: string;
};

type ListOrdersResponse = {
  data: OrderHttpResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

describe('Orders E2E', () => {
  let app: INestApplication;
  let resetState: () => void;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    resetState = testApp.resetState;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    resetState();
  });

  function getHttpServer(): Parameters<typeof request>[0] {
    return app.getHttpServer() as Parameters<typeof request>[0];
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
    const { token } = await createAndAuthenticateAdmin(getHttpServer());
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
    const { token } = await createAndAuthenticateAdmin(getHttpServer());
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
    const { token } = await createAndAuthenticateAdmin(getHttpServer());
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

    const createdOrder = createResponse.body as OrderHttpResponse;

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

    expect((inProgressResponse.body as OrderHttpResponse).status).toBe(
      OrderStatus.EM_ANDAMENTO,
    );
  });

  it('should update order data through HTTP', async () => {
    const { token } = await createAndAuthenticateAdmin(getHttpServer());
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

    const createdOrder = createResponse.body as OrderHttpResponse;

    const updateResponse = await request(getHttpServer())
      .patch(`/orders/${createdOrder.id}`)
      .set(authHeader)
      .send({
        descricao: 'Depois',
        valor_estimado: 120.5,
      } satisfies UpdateOrderDto)
      .expect(200);

    const updatedOrder = updateResponse.body as OrderHttpResponse;

    expect(updatedOrder.descricao).toBe('Depois');
    expect(updatedOrder.valor_estimado).toBe('120.50');
  });
});
