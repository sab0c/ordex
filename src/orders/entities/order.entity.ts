import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  ABERTA = 'Aberta',
  EM_ANDAMENTO = 'Em andamento',
  CONCLUIDA = 'Concluída',
  CANCELADA = 'Cancelada',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  cliente!: string;

  @Column({ type: 'text' })
  descricao!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  valor_estimado!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.ABERTA })
  status!: OrderStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  data_criacao!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  data_atualizacao!: Date;
}
