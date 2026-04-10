import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { trimStringTransform } from '../../common/transforms/trim-string.transform';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @ApiProperty({
    example: 'Maria da Silva',
    description: 'Nome do cliente da ordem de serviço.',
  })
  @IsString({ message: 'O campo cliente deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo cliente é obrigatório.' })
  @Transform(trimStringTransform)
  cliente!: string;

  @ApiProperty({
    example: 'Troca de tela e revisão geral',
    description: 'Descrição do serviço solicitado.',
  })
  @IsString({ message: 'O campo descricao deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório.' })
  @Transform(trimStringTransform)
  descricao!: string;

  @ApiProperty({
    example: 199.9,
    description: 'Valor estimado para execução do serviço.',
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O campo valor_estimado deve ser um numero valido.' },
  )
  @Min(0, { message: 'O campo valor_estimado não pode ser negativo.' })
  valor_estimado!: number;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.ABERTA,
    description: 'Status inicial da ordem. Se omitido, a API usa Aberta.',
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'O campo status é inválido.' })
  status?: OrderStatus;
}
