import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';

@Entity({ name: 'orders' })
export class Order {
  @ApiProperty({ example: 1, description: 'Identificador único da ordem.' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    example: 'Maria da Silva',
    description: 'Nome do cliente vinculado à ordem.',
  })
  @Column({ type: 'varchar', length: 255 })
  cliente!: string;

  @ApiProperty({
    example: 'Troca de tela e revisão geral',
    description: 'Descrição do serviço solicitado.',
  })
  @Column({ type: 'text' })
  descricao!: string;

  @ApiProperty({
    example: '199.90',
    description: 'Valor estimado persistido pela aplicação.',
  })
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  valor_estimado!: string;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.ABERTA,
    description: 'Status atual da ordem de serviço.',
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.ABERTA })
  status!: OrderStatus;

  @ApiProperty({
    example: '2026-04-09T12:00:00.000Z',
    description: 'Data de criação da ordem.',
  })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  data_criacao!: Date;

  @ApiProperty({
    example: '2026-04-09T12:30:00.000Z',
    description: 'Data da última atualização da ordem.',
  })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  data_atualizacao!: Date;
}
