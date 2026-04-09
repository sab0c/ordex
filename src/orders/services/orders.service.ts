import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from '../orders.constants';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';
import {
  CreateOrderRepositoryData,
  UpdateOrderRepositoryData,
} from '../repositories/order.repository';
import type { OrderRepository } from '../repositories/order.repository';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderData: CreateOrderRepositoryData = {
      cliente: createOrderDto.cliente,
      descricao: createOrderDto.descricao,
      valor_estimado: this.formatValorEstimado(createOrderDto.valor_estimado),
      status: createOrderDto.status ?? OrderStatus.ABERTA,
    };

    return await this.orderRepository.create(orderData);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.findAll();
  }

  async findById(id: number): Promise<Order> {
    return await this.findOrderOrFail(id);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOrderOrFail(id);

    this.ensureOrderIsEditable(order);

    const updatedData = this.buildUpdateData(updateOrderDto);

    Object.assign(order, updatedData);

    return await this.orderRepository.save(order);
  }

  async updateStatus(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOrderOrFail(id);
    const nextStatus = updateOrderStatusDto.status;

    this.ensureOrderIsEditable(order);
    this.ensureStatusTransitionIsAllowed(order.status, nextStatus);

    order.status = nextStatus;

    return await this.orderRepository.save(order);
  }

  private async findOrderOrFail(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Ordem de serviço não encontrada.');
    }

    return order;
  }

  private buildUpdateData(
    updateOrderDto: UpdateOrderDto,
  ): UpdateOrderRepositoryData {
    const updatedData: UpdateOrderRepositoryData = {};

    if (updateOrderDto.cliente !== undefined) {
      updatedData.cliente = updateOrderDto.cliente;
    }

    if (updateOrderDto.descricao !== undefined) {
      updatedData.descricao = updateOrderDto.descricao;
    }

    if (updateOrderDto.valor_estimado !== undefined) {
      updatedData.valor_estimado = this.formatValorEstimado(
        updateOrderDto.valor_estimado,
      );
    }

    return updatedData;
  }

  private ensureOrderIsEditable(order: Order): void {
    if (order.status === OrderStatus.CANCELADA) {
      throw new ConflictException('Uma ordem cancelada não pode ser alterada.');
    }
  }

  private ensureStatusTransitionIsAllowed(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ): void {
    if (
      nextStatus === OrderStatus.CONCLUIDA &&
      currentStatus !== OrderStatus.EM_ANDAMENTO
    ) {
      throw new ConflictException(
        'Uma ordem só pode ser concluída se estiver Em andamento.',
      );
    }
  }

  private formatValorEstimado(value: number): string {
    return value.toFixed(2);
  }
}
