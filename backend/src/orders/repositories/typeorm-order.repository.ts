import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  getPostgresAccentInsensitiveExpression,
  normalizeTextForSearch,
} from '../../common/utils/text-normalization.util';
import { Order } from '../entities/order.entity';
import {
  CreateOrderRepositoryData,
  ListOrdersRepositoryFilters,
  OrderMetricsRepositoryResult,
  ListOrdersRepositoryResult,
  OrderRepository,
} from './order.repository';
import { OrderStatus } from '../enums/order-status.enum';

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  async create(data: CreateOrderRepositoryData): Promise<Order> {
    const order = this.repository.create(data);

    return this.repository.save(order);
  }

  async findAll(
    filters: ListOrdersRepositoryFilters,
  ): Promise<ListOrdersRepositoryResult> {
    const queryBuilder = this.repository.createQueryBuilder('order');

    if (filters.cliente !== undefined) {
      queryBuilder.andWhere(
        `${getPostgresAccentInsensitiveExpression('order.cliente')} LIKE :cliente`,
        {
          cliente: `%${normalizeTextForSearch(filters.cliente)}%`,
        },
      );
    }

    if (filters.status !== undefined) {
      queryBuilder.andWhere('order.status = :status', {
        status: filters.status,
      });
    }

    queryBuilder
      .orderBy(
        `order.${filters.sortBy}`,
        filters.sortOrder.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit),
      },
    };
  }

  async getMetrics(): Promise<OrderMetricsRepositoryResult> {
    const rawMetrics = await this.repository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'totalOrders')
      .addSelect(
        `COUNT(*) FILTER (WHERE order.status = :openStatus)`,
        'openOrders',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE order.status = :inProgressStatus)`,
        'inProgressOrders',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE order.status = :concludedStatus)`,
        'concludedOrders',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE order.status = :cancelledStatus)`,
        'cancelledOrders',
      )
      .addSelect(
        'COALESCE(SUM(order.valor_estimado), 0)',
        'totalEstimatedValue',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE order.data_criacao >= NOW() - INTERVAL '3 days')`,
        'recentOrdersLastThreeDays',
      )
      .setParameters({
        openStatus: OrderStatus.ABERTA,
        inProgressStatus: OrderStatus.EM_ANDAMENTO,
        concludedStatus: OrderStatus.CONCLUIDA,
        cancelledStatus: OrderStatus.CANCELADA,
      })
      .getRawOne<{
        totalOrders: string;
        openOrders: string;
        inProgressOrders: string;
        concludedOrders: string;
        cancelledOrders: string;
        totalEstimatedValue: string;
        recentOrdersLastThreeDays: string;
      }>();

    return {
      totalOrders: Number(rawMetrics?.totalOrders ?? 0),
      openOrders: Number(rawMetrics?.openOrders ?? 0),
      inProgressOrders: Number(rawMetrics?.inProgressOrders ?? 0),
      concludedOrders: Number(rawMetrics?.concludedOrders ?? 0),
      cancelledOrders: Number(rawMetrics?.cancelledOrders ?? 0),
      totalEstimatedValue: Number(rawMetrics?.totalEstimatedValue ?? 0),
      recentOrdersLastThreeDays: Number(
        rawMetrics?.recentOrdersLastThreeDays ?? 0,
      ),
    };
  }

  async findById(id: number): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
}
