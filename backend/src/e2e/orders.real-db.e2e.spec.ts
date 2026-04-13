import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { createAndAuthenticateAdmin } from './helpers/create-and-authenticate-admin';
import {
  createOrderThroughHttp,
  type OrderHttpResponse,
} from './helpers/create-order-through-http';
import { createRealDbTestApp } from './support/create-real-db-test-app';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { OrderStatus } from '../orders/enums/order-status.enum';

type MetricsResponse = {
  totalOrders: number;
  openOrders: number;
  inProgressOrders: number;
  concludedOrders: number;
  cancelledOrders: number;
  totalEstimatedValue: number;
  recentOrdersLastThreeDays: number;
};

describe('Orders Real DB E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let resetDatabase: () => Promise<void>;

  const orderPayloads: CreateOrderDto[] = [
    {
      cliente: 'Cliente Persistido',
      descricao: 'Instalação completa',
      valor_estimado: 350.5,
      status: OrderStatus.ABERTA,
    },
    {
      cliente: 'Cliente Em Progresso',
      descricao: 'Manutenção preventiva',
      valor_estimado: 420,
      status: OrderStatus.EM_ANDAMENTO,
    },
    {
      cliente: 'Cliente Cancelado',
      descricao: 'Diagnóstico não aprovado',
      valor_estimado: 90,
      status: OrderStatus.CANCELADA,
    },
  ];

  beforeAll(async () => {
    const realDbTestApp = await createRealDbTestApp();

    app = realDbTestApp.app;
    dataSource = realDbTestApp.dataSource;
    resetDatabase = realDbTestApp.resetDatabase;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  function getHttpServer(): Parameters<typeof request>[0] {
    return app.getHttpServer() as Parameters<typeof request>[0];
  }

  it('should persist orders in postgres and return aggregated metrics', async () => {
    const { token } = await createAndAuthenticateAdmin(getHttpServer());

    const createdOrders = [] as OrderHttpResponse[];

    for (const payload of orderPayloads) {
      createdOrders.push(
        await createOrderThroughHttp(getHttpServer(), token, payload),
      );
    }

    const metricsResponse = await request(getHttpServer())
      .get('/orders/metrics')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);

    expect(metricsResponse.body as MetricsResponse).toMatchObject({
      totalOrders: 3,
      openOrders: 1,
      inProgressOrders: 1,
      concludedOrders: 0,
      cancelledOrders: 1,
      totalEstimatedValue: 860.5,
      recentOrdersLastThreeDays: 3,
    });

    expect(createdOrders).toEqual([
      expect.objectContaining({
        cliente: 'Cliente Persistido',
        valor_estimado: '350.50',
        status: OrderStatus.ABERTA,
      }),
      expect.objectContaining({
        cliente: 'Cliente Em Progresso',
        valor_estimado: '420.00',
        status: OrderStatus.EM_ANDAMENTO,
      }),
      expect.objectContaining({
        cliente: 'Cliente Cancelado',
        valor_estimado: '90.00',
        status: OrderStatus.CANCELADA,
      }),
    ]);

    const persistedOrders = await dataSource.query(
      'SELECT cliente, valor_estimado, status FROM "orders" ORDER BY id ASC;',
    );

    expect(persistedOrders).toEqual([
      {
        cliente: 'Cliente Persistido',
        valor_estimado: '350.50',
        status: OrderStatus.ABERTA,
      },
      {
        cliente: 'Cliente Em Progresso',
        valor_estimado: '420.00',
        status: OrderStatus.EM_ANDAMENTO,
      },
      {
        cliente: 'Cliente Cancelado',
        valor_estimado: '90.00',
        status: OrderStatus.CANCELADA,
      },
    ]);
  });
});
