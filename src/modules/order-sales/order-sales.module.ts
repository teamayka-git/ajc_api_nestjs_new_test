import { Module } from '@nestjs/common';
import { OrderSalesService } from './order-sales.service';
import { OrderSalesController } from './order-sales.controller';
import { ModelNames } from 'src/common/model_names';
import { OrderSalesSchema } from 'src/tableModels/order_sales.model';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSalesDocumentsSchema } from 'src/tableModels/order_sales_documents.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { CustomersSchema } from 'src/tableModels/customers.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.ORDER_SALES,schema:OrderSalesSchema},{name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},{name:ModelNames.COUNTERS,schema:CountersSchema},{name:ModelNames.CUSTOMERS,schema:CustomersSchema},
    { name: ModelNames.ORDER_SALES_DOCUMENTS, schema: OrderSalesDocumentsSchema },])],
  controllers: [OrderSalesController],
  providers: [OrderSalesService]
})
export class OrderSalesModule {}
