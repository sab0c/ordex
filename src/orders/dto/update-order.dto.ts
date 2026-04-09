import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  cliente?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as string),
  )
  descricao?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  valor_estimado?: number;
}
