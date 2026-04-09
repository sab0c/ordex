import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  cliente!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  descricao!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  valor_estimado!: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
