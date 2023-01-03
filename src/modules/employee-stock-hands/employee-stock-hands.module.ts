import { Module } from '@nestjs/common';
import { EmployeeStockHandsService } from './employee-stock-hands.service';
import { EmployeeStockHandsController } from './employee-stock-hands.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { EmployeeStockInHandsItemSchema } from 'src/tableModels/employee_stock_in_hand_item.model';
import { EmployeeStockInHandsSchema } from 'src/tableModels/employee_stock_in_hand.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { ProductsSchema } from 'src/tableModels/products.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.EMPLOYEE_STOCK_IN_HANDS, schema: EmployeeStockInHandsSchema },
      { name: ModelNames.EMPLOYEE_STOCK_IN_HAND_ITEMS, schema: EmployeeStockInHandsItemSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.PRODUCTS, schema: ProductsSchema },
    ]),
  ],
  controllers: [EmployeeStockHandsController],
  providers: [EmployeeStockHandsService]
})
export class EmployeeStockHandsModule {}
