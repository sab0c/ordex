import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ListOrdersQueryDto } from '../dto/list-orders-query.dto';
import { ListOrdersResponseDto } from '../dto/list-orders-response.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { Order } from '../entities/order.entity';
import { OrdersService } from '../services/orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova ordem de serviço' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({ description: 'Ordem criada com sucesso.', type: Order })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ordens de serviço' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ordens retornada com sucesso.',
    type: ListOrdersResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async findAll(
    @Query() queryDto: ListOrdersQueryDto,
  ): Promise<ListOrdersResponseDto> {
    return this.ordersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma ordem de serviço por id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Ordem encontrada com sucesso.',
    type: Order,
  })
  @ApiNotFoundResponse({ description: 'Ordem de serviço não encontrada.' })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar uma ordem de serviço' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Ordem atualizada com sucesso.',
    type: Order,
  })
  @ApiNotFoundResponse({ description: 'Ordem de serviço não encontrada.' })
  @ApiConflictResponse({
    description: 'A ordem não pode ser alterada no estado atual.',
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar o status de uma ordem de serviço' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado com sucesso.',
    type: Order,
  })
  @ApiNotFoundResponse({ description: 'Ordem de serviço não encontrada.' })
  @ApiConflictResponse({
    description: 'A transição de status não é permitida para a ordem.',
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT ausente ou inválido.' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
