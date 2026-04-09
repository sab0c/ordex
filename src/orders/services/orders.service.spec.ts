import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ORDER_REPOSITORY } from '../orders.constants';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderRepository } from '../repositories/order.repository';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: jest.Mocked<OrderRepository>;

  const makeOrder = (overrides: Partial<Order> = {}): Order => ({
    id: 1,
    cliente: 'Cliente Teste',
    descricao: 'Descricao Teste',
    valor_estimado: '100.00',
    status: OrderStatus.ABERTA,
    data_criacao: new Date(),
    data_atualizacao: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: ORDER_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should reject completion when order is not in progress', async () => {
    repository.findById.mockResolvedValue(makeOrder());

    await expect(
      service.updateStatus(1, { status: OrderStatus.CONCLUIDA }),
    ).rejects.toThrow(ConflictException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should reject updates for cancelled orders', async () => {
    repository.findById.mockResolvedValue(
      makeOrder({
        cliente: 'Cliente Cancelado',
        descricao: 'Descricao Cancelada',
        status: OrderStatus.CANCELADA,
      }),
    );

    await expect(
      service.update(1, { descricao: 'Nova descricao' }),
    ).rejects.toThrow(ConflictException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should create an order with formatted estimated value', async () => {
    const createdOrder = makeOrder({
      valor_estimado: '150.50',
      status: OrderStatus.EM_ANDAMENTO,
    });

    repository.create.mockResolvedValue(createdOrder);

    const result = await service.create({
      cliente: 'Cliente Novo',
      descricao: 'Troca de bateria',
      valor_estimado: 150.5,
      status: OrderStatus.EM_ANDAMENTO,
    });

    expect(repository.create).toHaveBeenCalledWith({
      cliente: 'Cliente Novo',
      descricao: 'Troca de bateria',
      valor_estimado: '150.50',
      status: OrderStatus.EM_ANDAMENTO,
    });
    expect(result).toEqual(createdOrder);
  });

  it('should update status when order is in progress', async () => {
    const order = makeOrder({
      status: OrderStatus.EM_ANDAMENTO,
    });
    const savedOrder = makeOrder({
      status: OrderStatus.CONCLUIDA,
    });

    repository.findById.mockResolvedValue(order);
    repository.save.mockResolvedValue(savedOrder);

    const result = await service.updateStatus(1, {
      status: OrderStatus.CONCLUIDA,
    });

    expect(repository.save).toHaveBeenCalledWith({
      ...order,
      status: OrderStatus.CONCLUIDA,
    });
    expect(result).toEqual(savedOrder);
  });

  it('should throw not found when order does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.update(99, { cliente: 'Cliente X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update regular fields and format valor_estimado', async () => {
    const order = makeOrder();
    const savedOrder = makeOrder({
      cliente: 'Cliente Atualizado',
      descricao: 'Descricao Atualizada',
      valor_estimado: '250.75',
    });

    repository.findById.mockResolvedValue(order);
    repository.save.mockResolvedValue(savedOrder);

    const result = await service.update(1, {
      cliente: 'Cliente Atualizado',
      descricao: 'Descricao Atualizada',
      valor_estimado: 250.75,
    });

    expect(repository.save).toHaveBeenCalledWith({
      ...order,
      cliente: 'Cliente Atualizado',
      descricao: 'Descricao Atualizada',
      valor_estimado: '250.75',
    });
    expect(result).toEqual(savedOrder);
  });

  it('should return all orders', async () => {
    const orders = [
      makeOrder(),
      makeOrder({
        id: 2,
        cliente: 'Outro Cliente',
      }),
    ];

    repository.findAll.mockResolvedValue(orders);

    const result = await service.findAll();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toEqual(orders);
  });

  it('should return an order by id', async () => {
    const order = makeOrder({
      id: 3,
    });

    repository.findById.mockResolvedValue(order);

    const result = await service.findById(3);

    expect(repository.findById).toHaveBeenCalledWith(3);
    expect(result).toEqual(order);
  });

  it('should reject status updates for cancelled orders', async () => {
    repository.findById.mockResolvedValue(
      makeOrder({
        status: OrderStatus.CANCELADA,
      }),
    );

    await expect(
      service.updateStatus(1, { status: OrderStatus.EM_ANDAMENTO }),
    ).rejects.toThrow(ConflictException);

    expect(repository.save).not.toHaveBeenCalled();
  });
});
