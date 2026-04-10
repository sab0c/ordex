import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimStringTransform } from '../../common/transforms/trim-string.transform';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username do admin semeado no banco.',
  })
  @IsString({ message: 'O campo username deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo username é obrigatório.' })
  @Transform(trimStringTransform)
  username!: string;

  @ApiProperty({
    example: 'strong-password',
    description: 'Senha do admin semeado no banco.',
  })
  @IsString({ message: 'O campo password deve ser um texto.' })
  @IsNotEmpty({ message: 'O campo password é obrigatório.' })
  password!: string;
}
