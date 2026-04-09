import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';

export type CreateOrderRepositoryData = {
  cliente: string;
  descricao: string;
  valor_estimado: string;
  status: OrderStatus;
};

export type UpdateOrderRepositoryData = Partial<CreateOrderRepositoryData>;

export interface OrderRepository {
  create(data: CreateOrderRepositoryData): Promise<Order>;
  findAll(): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  save(order: Order): Promise<Order>;
}
