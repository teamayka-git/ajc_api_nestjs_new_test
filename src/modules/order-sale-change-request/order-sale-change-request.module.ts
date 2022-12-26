import { Module } from '@nestjs/common';
import { OrderSaleChangeRequestService } from './order-sale-change-request.service';
import { OrderSaleChangeRequestController } from './order-sale-change-request.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { OrderSaleChangeRequestsSchema } from 'src/tableModels/order_sale_change_requests.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { RootCausesSchema } from 'src/tableModels/rootCause.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { OrderSaleChangeRequestDocumentsSchema } from 'src/tableModels/order_sale_change_request_documents.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.ORDER_SALE_CHANGE_REQUESTS, schema: OrderSaleChangeRequestsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema:OrderSalesMainSchema },
      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
      { name: ModelNames.ORDER_SALE_CHANGE_REQUEST_DOCUMENTS, schema:OrderSaleChangeRequestDocumentsSchema },
      { name: ModelNames.ROOT_CAUSES, schema: RootCausesSchema },  {
        name: ModelNames.ORDER_SALE_HISTORIES,
        schema: OrderSaleHistoriesSchema,
      },
    ]),
  ],
  controllers: [OrderSaleChangeRequestController],
  providers: [OrderSaleChangeRequestService]
})
export class OrderSaleChangeRequestModule {}
 