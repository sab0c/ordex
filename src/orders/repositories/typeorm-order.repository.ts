import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import {
  CreateOrderRepositoryData,
  ListOrdersRepositoryFilters,
  ListOrdersRepositoryResult,
  OrderRepository,
} from './order.repository';

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
      queryBuilder.andWhere('order.cliente ILIKE :cliente', {
        cliente: `%${filters.cliente}%`,
      });
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

  async findById(id: number): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }
}
