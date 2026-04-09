import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  cliente!: string;
  descricao!: string;
  valor_estimado!: number | string;
  status?: OrderStatus | string;
}
