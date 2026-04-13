import { ApiProperty } from '@nestjs/swagger';

export class OrdersMetricsResponseDto {
  @ApiProperty({ example: 36 })
  totalOrders!: number;

  @ApiProperty({ example: 10 })
  openOrders!: number;

  @ApiProperty({ example: 12 })
  inProgressOrders!: number;

  @ApiProperty({ example: 9 })
  concludedOrders!: number;

  @ApiProperty({ example: 5 })
  cancelledOrders!: number;

  @ApiProperty({ example: 8640.4 })
  totalEstimatedValue!: number;

  @ApiProperty({ example: 6 })
  recentOrdersLastThreeDays!: number;
}
