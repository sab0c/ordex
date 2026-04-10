import { Order } from '../entities/order.entity';
import { OrderSortBy, SortOrder } from '../dto/list-orders-query.dto';
import { OrderStatus } from '../enums/order-status.enum';

export type CreateOrderRepositoryData = {
  cliente: string;
  descricao: string;
  valor_estimado: string;
  status: OrderStatus;
};

export type UpdateOrderRepositoryData = Partial<CreateOrderRepositoryData>;

export type ListOrdersRepositoryFilters = {
  cliente?: string;
  status?: OrderStatus;
  page: number;
  limit: number;
  sortBy: OrderSortBy;
  sortOrder: SortOrder;
};

export type ListOrdersRepositoryResult = {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export interface OrderRepository {
  create(data: CreateOrderRepositoryData): Promise<Order>;
  findAll(
    filters: ListOrdersRepositoryFilters,
  ): Promise<ListOrdersRepositoryResult>;
  findById(id: number): Promise<Order | null>;
  save(order: Order): Promise<Order>;
}
