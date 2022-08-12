import { Module } from '@nestjs/common';
import { DeliveryReturnService } from './delivery-return.service';
import { DeliveryReturnController } from './delivery-return.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryReturnSchema } from 'src/tableModels/delivery_return.model';
import { DeliveryReturnItemsSchema } from 'src/tableModels/delivery_return_items.model';
import { DeliveryRejectedPendingsSchema } from 'src/tableModels/delivery_rejected_pendings.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { OrderSaleSetProcessesSchema } from 'src/tableModels/order_sale_set_processes.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_RETURN, schema: DeliveryReturnSchema },
      { name: ModelNames.DELIVERY_RETURN_ITEMS, schema: DeliveryReturnItemsSchema },
      { name: ModelNames.DELIVERY_REJECTED_PENDINGS, schema: DeliveryRejectedPendingsSchema },
      { name: ModelNames.COUNTERS, schema:CountersSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema:OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALE_HISTORIES, schema:OrderSaleHistoriesSchema },
      { name: ModelNames.ORDER_SALE_SET_PROCESSES, schema:OrderSaleSetProcessesSchema },
    ]),
  ],
  controllers: [DeliveryReturnController],
  providers: [DeliveryReturnService]
})
export class DeliveryReturnModule {}
