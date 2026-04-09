import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'O campo status é inválido.' })
  status!: OrderStatus;
}
