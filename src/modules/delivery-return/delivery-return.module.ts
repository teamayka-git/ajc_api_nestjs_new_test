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
import { OrderSalesItemsSchema } from 'src/tableModels/order_sales_items.model';
import { OrderSalesDocumentsSchema } from 'src/tableModels/order_sales_documents.model';
import { OrderCancelRejectReportsSchema } from 'src/tableModels/order_cancel_reject_reports.model';
import { ReworkReportsSchema } from 'src/tableModels/order_rework_reports.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_RETURN, schema: DeliveryReturnSchema },
      { name: ModelNames.DELIVERY_RETURN_ITEMS, schema: DeliveryReturnItemsSchema },
      { name: ModelNames.DELIVERY_REJECTED_PENDINGS, schema: DeliveryRejectedPendingsSchema },
      { name: ModelNames.COUNTERS, schema:CountersSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema:OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALES_ITEMS, schema:OrderSalesItemsSchema },
      { name: ModelNames.ORDER_SALES_DOCUMENTS, schema:OrderSalesDocumentsSchema },
      { name: ModelNames.ORDER_SALE_HISTORIES, schema:OrderSaleHistoriesSchema },
      { name: ModelNames.ORDER_SALE_SET_PROCESSES, schema:OrderSaleSetProcessesSchema },
      
      { name: ModelNames.REWORK_REPORTS, schema: ReworkReportsSchema },
      { name: ModelNames.ORDER_REJECTED_CANCEL_REPORTS, schema: OrderCancelRejectReportsSchema },
    ]),
  ],
  controllers: [DeliveryReturnController],
  providers: [DeliveryReturnService]
})
export class DeliveryReturnModule {}
