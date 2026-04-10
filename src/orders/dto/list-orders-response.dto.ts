import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../entities/order.entity';

export class OrdersPaginationDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class ListOrdersResponseDto {
  @ApiProperty({
    type: Order,
    isArray: true,
  })
  data!: Order[];

  @ApiProperty({
    type: OrdersPaginationDto,
  })
  pagination!: OrdersPaginationDto;
}
