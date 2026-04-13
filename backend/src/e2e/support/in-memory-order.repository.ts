import { normalizeTextForSearch } from '../../common/utils/text-normalization.util';
import { OrderSortBy, SortOrder } from '../../orders/dto/list-orders-query.dto';
import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import {
  CreateOrderRepositoryData,
  ListOrdersRepositoryFilters,
  OrderMetricsRepositoryResult,
  ListOrdersRepositoryResult,
  OrderRepository,
} from '../../orders/repositories/order.repository';

export class InMemoryOrderRepository implements OrderRepository {
  private currentId = 1;
  private orders: Order[] = [];

  reset(): void {
    this.currentId = 1;
    this.orders = [];
  }

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

  getMetrics(): Promise<OrderMetricsRepositoryResult> {
    const lastThreeDaysThreshold = Date.now() - 3 * 24 * 60 * 60 * 1000;

    return Promise.resolve({
      totalOrders: this.orders.length,
      openOrders: this.orders.filter(
        (order) => order.status === OrderStatus.ABERTA,
      ).length,
      inProgressOrders: this.orders.filter(
        (order) => order.status === OrderStatus.EM_ANDAMENTO,
      ).length,
      concludedOrders: this.orders.filter(
        (order) => order.status === OrderStatus.CONCLUIDA,
      ).length,
      cancelledOrders: this.orders.filter(
        (order) => order.status === OrderStatus.CANCELADA,
      ).length,
      totalEstimatedValue: this.orders.reduce(
        (accumulator, order) => accumulator + Number(order.valor_estimado),
        0,
      ),
      recentOrdersLastThreeDays: this.orders.filter(
        (order) => order.data_criacao.getTime() >= lastThreeDaysThreshold,
      ).length,
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
