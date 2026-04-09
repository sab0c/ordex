import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './controllers/orders.controller';
import { Order } from './entities/order.entity';
import { ORDER_REPOSITORY } from './orders.constants';
import { TypeOrmOrderRepository } from './repositories/typeorm-order.repository';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    TypeOrmOrderRepository,
    {
      provide: ORDER_REPOSITORY,
      useExisting: TypeOrmOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY, OrdersService],
})
export class OrdersModule {}
