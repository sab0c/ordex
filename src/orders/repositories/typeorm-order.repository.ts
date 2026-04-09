import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderRepositoryData, OrderRepository } from './order.repository';

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

  async findAll(): Promise<Order[]> {
    return this.repository.find({
      order: {
        data_criacao: 'DESC',
      },
    });
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
