import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.EM_ANDAMENTO,
    description: 'Novo status desejado para a ordem.',
  })
  @IsEnum(OrderStatus, { message: 'O campo status é inválido.' })
  status!: OrderStatus;
}
