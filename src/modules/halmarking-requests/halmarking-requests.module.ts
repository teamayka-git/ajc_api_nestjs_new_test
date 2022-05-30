import { Module } from '@nestjs/common';
import { HalmarkingRequestsService } from './halmarking-requests.service';
import { HalmarkingRequestsController } from './halmarking-requests.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { HalmarkingRequestsSchema } from 'src/tableModels/halmarking_requests.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { OrderSalesSchema } from 'src/tableModels/order_sales.model';
import { ProductsSchema } from 'src/tableModels/products.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelNames.HALMARKING_REQUESTS,
        schema: HalmarkingRequestsSchema,
      },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.ORDER_SALES, schema: OrderSalesSchema },
      { name: ModelNames.ORDER_SALE_HISTORIES, schema: OrderSaleHistoriesSchema },
      { name: ModelNames.PRODUCTS, schema: ProductsSchema },
    ]),
  ],
  controllers: [HalmarkingRequestsController],
  providers: [HalmarkingRequestsService],
})
export class HalmarkingRequestsModule {}
