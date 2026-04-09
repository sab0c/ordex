import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { trimStringTransform } from '../../common/transforms/trim-string.transform';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @IsString({ message: 'O campo cliente deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo cliente é obrigatório.' })
  @Transform(trimStringTransform)
  cliente!: string;

  @IsString({ message: 'O campo descricao deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório.' })
  @Transform(trimStringTransform)
  descricao!: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O campo valor_estimado deve ser um numero valido.' },
  )
  valor_estimado!: number;

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'O campo status é inválido.' })
  status?: OrderStatus;
}
