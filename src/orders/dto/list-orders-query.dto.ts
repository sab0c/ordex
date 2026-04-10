import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { trimStringTransform } from '../../common/transforms/trim-string.transform';
import { OrderStatus } from '../enums/order-status.enum';

export enum OrderSortBy {
  DATA_CRIACAO = 'data_criacao',
  VALOR_ESTIMADO = 'valor_estimado',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListOrdersQueryDto {
  @ApiPropertyOptional({
    example: 'Maria',
    description: 'Filtra ordens por nome do cliente.',
  })
  @IsOptional()
  @IsString({ message: 'O campo cliente deve ser um texto.' })
  @Transform(trimStringTransform)
  cliente?: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.EM_ANDAMENTO,
    description: 'Filtra ordens por status.',
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'O campo status é inválido.' })
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número da página desejada.',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O campo page deve ser um número inteiro.' })
  @Min(1, { message: 'O campo page deve ser maior ou igual a 1.' })
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade de itens por página.',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O campo limit deve ser um número inteiro.' })
  @Min(1, { message: 'O campo limit deve ser maior ou igual a 1.' })
  @Max(100, { message: 'O campo limit deve ser menor ou igual a 100.' })
  limit?: number;

  @ApiPropertyOptional({
    enum: OrderSortBy,
    example: OrderSortBy.DATA_CRIACAO,
    description: 'Campo usado para ordenação.',
    default: OrderSortBy.DATA_CRIACAO,
  })
  @IsOptional()
  @IsEnum(OrderSortBy, { message: 'O campo sort_by é inválido.' })
  sort_by?: OrderSortBy;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Direção da ordenação.',
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'O campo sort_order é inválido.' })
  sort_order?: SortOrder;
}
