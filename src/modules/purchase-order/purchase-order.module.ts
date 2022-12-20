import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { PurchaseBookingSchema } from 'src/tableModels/purchase_booking.model';
import { PurchaseOrderItemSchema } from 'src/tableModels/purchase_order_item.model';
import { PurchaseOrderSchema } from 'src/tableModels/purchase_order.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PURCHASE_BOOKINGS, schema: PurchaseBookingSchema },
      { name: ModelNames.PURCHASE_ORDERS, schema: PurchaseOrderSchema },
      { name: ModelNames.PURCHASE_ORDER_ITEMS, schema: PurchaseOrderItemSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService]
})
export class PurchaseOrderModule {}
 