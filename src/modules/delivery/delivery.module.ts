import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliverySchema } from 'src/tableModels/delivery.model';
import { DeliveryItemsSchema } from 'src/tableModels/delivery_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { DeliveryTempSchema } from 'src/tableModels/delivery_temp.model';
import { RootCausesSchema } from 'src/tableModels/rootCause.model';
import { DeliveryRejectedPendingsSchema } from 'src/tableModels/delivery_rejected_pendings.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
      { name: ModelNames.DELIVERY, schema: DeliverySchema },
      { name: ModelNames.DELIVERY_ITEMS, schema: DeliveryItemsSchema },
      { name: ModelNames.DELIVERY_TEMP, schema: DeliveryTempSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.ROOT_CAUSES, schema: RootCausesSchema },
      { name: ModelNames.DELIVERY_REJECTED_PENDINGS, schema: DeliveryRejectedPendingsSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema: OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALE_HISTORIES, schema: OrderSaleHistoriesSchema },
    ]),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService]
})
export class DeliveryModule {}
