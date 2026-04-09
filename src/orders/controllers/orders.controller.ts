import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { Order } from '../entities/order.entity';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.ordersService.create(createOrderDto);
  }

  @Get()
  async findAll(): Promise<Order[]> {
    return await this.ordersService.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return await this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return await this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
