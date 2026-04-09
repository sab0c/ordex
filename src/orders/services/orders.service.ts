import {
  BadRequestException,
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
      cliente: this.parseRequiredText(createOrderDto.cliente, 'cliente'),
      descricao: this.parseRequiredText(createOrderDto.descricao, 'descricao'),
      valor_estimado: this.parseValorEstimado(createOrderDto.valor_estimado),
      status: this.parseStatus(createOrderDto.status ?? OrderStatus.ABERTA),
    };

    return await this.orderRepository.create(orderData);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.findAll();
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
    const nextStatus = this.parseStatus(updateOrderStatusDto.status);

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
      updatedData.cliente = this.parseRequiredText(updateOrderDto.cliente, 'cliente');
    }

    if (updateOrderDto.descricao !== undefined) {
      updatedData.descricao = this.parseRequiredText(
        updateOrderDto.descricao,
        'descricao',
      );
    }

    if (updateOrderDto.valor_estimado !== undefined) {
      updatedData.valor_estimado = this.parseValorEstimado(
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

  private parseRequiredText(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`O campo ${fieldName} é obrigatório.`);
    }

    return value.trim();
  }

  private parseValorEstimado(value: unknown): string {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException('O campo valor_estimado é obrigatório.');
    }

    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (typeof numericValue !== 'number' || Number.isNaN(numericValue)) {
      throw new BadRequestException('O campo valor_estimado deve ser numérico.');
    }

    return numericValue.toFixed(2);
  }

  private parseStatus(value: unknown): OrderStatus {
    if (typeof value !== 'string') {
      throw new BadRequestException('O campo status é inválido.');
    }

    const validStatuses = Object.values(OrderStatus);

    if (!validStatuses.includes(value as OrderStatus)) {
      throw new BadRequestException('O campo status é inválido.');
    }

    return value as OrderStatus;
  }
}
