import request from 'supertest';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';
import { OrderStatus } from '../../orders/enums/order-status.enum';

export type OrderHttpResponse = {
  id: number;
  cliente: string;
  descricao: string;
  valor_estimado: string;
  status: OrderStatus;
};

export async function createOrderThroughHttp(
  httpServer: Parameters<typeof request>[0],
  token: string,
  payload: CreateOrderDto,
): Promise<OrderHttpResponse> {
  const response = await request(httpServer)
    .post('/orders')
    .set({ Authorization: `Bearer ${token}` })
    .send(payload)
    .expect(201);

  return response.body as OrderHttpResponse;
}
