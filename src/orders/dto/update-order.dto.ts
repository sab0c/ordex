import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { trimStringTransform } from '../../common/transforms/trim-string.transform';

export class UpdateOrderDto {
  @IsOptional()
  @IsString({ message: 'O campo cliente deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo cliente não pode estar vazio.' })
  @Transform(trimStringTransform)
  cliente?: string;

  @IsOptional()
  @IsString({ message: 'O campo descricao deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo descricao não pode estar vazio.' })
  @Transform(trimStringTransform)
  descricao?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O campo valor_estimado deve ser um numero valido.' },
  )
  valor_estimado?: number;
}
