import { Module } from '@nestjs/common';
import { OrderSaleSetProcessService } from './order-sale-set-process.service';
import { OrderSaleSetProcessController } from './order-sale-set-process.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { OrderSaleSetProcessesSchema } from 'src/tableModels/order_sale_set_processes.model';
import { OrderSaleSetProcessHistoriesSchema } from 'src/tableModels/order_sale_set_process_histories.model';
import { OrderSaleSetSubProcessesSchema } from 'src/tableModels/order_sale_set_sub_processes.model';
import { OrderSaleSetSubProcessHistoriesSchema } from 'src/tableModels/order_sale_set_sub_process_histories.model';
import { SubProcessMasterSchema } from 'src/tableModels/subProcessMaster.model';
import { OrderSalesSchema } from 'src/tableModels/order_sales.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { EmployeeSchema } from 'src/tableModels/employee.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.ORDER_SALE_SET_PROCESSES,schema:OrderSaleSetProcessesSchema},
    {name:ModelNames.ORDER_SALE_SET_PROCESS_HISTORIES,schema:OrderSaleSetProcessHistoriesSchema},
    {name:ModelNames.SUB_PROCESS_MASTER,schema:SubProcessMasterSchema},
    {name:ModelNames.ORDER_SALES,schema:OrderSalesSchema},
    {name:ModelNames.ORDER_SALE_HISTORIES,schema:OrderSaleHistoriesSchema},
    {name:ModelNames.ORDER_SALE_SET_SUB_PROCESSES,schema:OrderSaleSetSubProcessesSchema},
    {name:ModelNames.ORDER_SALE_SET_SUB_PROCESS_HISTORIES,schema:OrderSaleSetSubProcessHistoriesSchema},
    {name:ModelNames.EMPLOYEES,schema:EmployeeSchema},
  
  ])],
  controllers: [OrderSaleSetProcessController],
  providers: [OrderSaleSetProcessService]
})
export class OrderSaleSetProcessModule {}
