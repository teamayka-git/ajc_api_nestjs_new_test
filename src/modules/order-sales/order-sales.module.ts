import { Module } from '@nestjs/common';
import { OrderSalesService } from './order-sales.service';
import { OrderSalesController } from './order-sales.controller';
import { ModelNames } from 'src/common/model_names';
import { OrderSalesSchema } from 'src/tableModels/order_sales.model';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSalesDocumentsSchema } from 'src/tableModels/order_sales_documents.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { ShopsSchema } from 'src/tableModels/shops.model';
import { UserSchema } from 'src/tableModels/user.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { EmployeeSchema } from 'src/tableModels/employee.model';
import { DepartmentsSchema } from 'src/tableModels/departments.model';
import { ProcessMasterSchema } from 'src/tableModels/processMaster.model';
import { OrderSaleSetProcessesSchema } from 'src/tableModels/order_sale_set_processes.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { OrderSalesItemsSchema } from 'src/tableModels/order_sales_items.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.USER, schema: UserSchema },
      { name: ModelNames.ORDER_SALES, schema: OrderSalesSchema },
      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.EMPLOYEES, schema: EmployeeSchema },
      { name: ModelNames.DEPARTMENT, schema: DepartmentsSchema },
      { name: ModelNames.PROCESS_MASTER, schema: ProcessMasterSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema:OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALES_ITEMS, schema:OrderSalesItemsSchema },
      { name: ModelNames.SHOPS, schema: ShopsSchema },
      {
        name: ModelNames.ORDER_SALE_HISTORIES,
        schema: OrderSaleHistoriesSchema,
      },
      {
        name: ModelNames.ORDER_SALES_DOCUMENTS,
        schema: OrderSalesDocumentsSchema,
      },

      {
        name: ModelNames.ORDER_SALE_SET_PROCESSES,
        schema: OrderSaleSetProcessesSchema,
      },
    ]),
  ],
  controllers: [OrderSalesController],
  providers: [OrderSalesService],
})
export class OrderSalesModule {}
