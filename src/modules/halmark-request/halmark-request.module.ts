import { Module } from '@nestjs/common';
import { HalmarkRequestService } from './halmark-request.service';
import { HalmarkRequestController } from './halmark-request.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { HalmarkBundlesSchema } from 'src/tableModels/halmark_bundles.model';
import { HalmarkOrderMainSchema } from 'src/tableModels/halmark_order_mains.model';
import { HalmarkOrderItemsSchema } from 'src/tableModels/halmark_order_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.HALMARK_BUNDLES, schema: HalmarkBundlesSchema },
      { name: ModelNames.HALMARK_ORDER_MAIN, schema: HalmarkOrderMainSchema },
      { name: ModelNames.HALMARK_ORDER_ITEMS, schema: HalmarkOrderItemsSchema },
      {name:ModelNames.COUNTERS,schema:CountersSchema},
      { name: ModelNames.ORDER_SALES_MAIN, schema:OrderSalesMainSchema },
      {
        name: ModelNames.ORDER_SALE_HISTORIES,
        schema: OrderSaleHistoriesSchema,
      },
    ]),
  ],
  controllers: [HalmarkRequestController],
  providers: [HalmarkRequestService],
})
export class HalmarkRequestModule {}
