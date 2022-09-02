import { Module } from '@nestjs/common';
import { DeliveryRejectedPendingService } from './delivery-rejected-pending.service';
import { DeliveryRejectedPendingController } from './delivery-rejected-pending.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryRejectedPendingsSchema } from 'src/tableModels/delivery_rejected_pendings.model';
import { DeliveryReturnSchema } from 'src/tableModels/delivery_return.model';
import { DeliveryReturnItemsSchema } from 'src/tableModels/delivery_return_items.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_REJECTED_PENDINGS, schema: DeliveryRejectedPendingsSchema },
      
      { name: ModelNames.ORDER_SALES_MAIN, schema: OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALE_HISTORIES, schema: OrderSaleHistoriesSchema },
    ]),
  ],
  controllers: [DeliveryRejectedPendingController],
  providers: [DeliveryRejectedPendingService]
})
export class DeliveryRejectedPendingModule {}
