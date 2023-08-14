import { Module } from '@nestjs/common';
import { DeliveryTempService } from './delivery-temp.service';
import { DeliveryTempController } from './delivery-temp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryTempSchema } from 'src/tableModels/delivery_temp.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { GeneralsSchema } from 'src/tableModels/generals.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_TEMP, schema: DeliveryTempSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema: OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALE_HISTORIES, schema: OrderSaleHistoriesSchema },
      { name: ModelNames.GENERALS, schema: GeneralsSchema },
    ]),
  ],
  controllers: [DeliveryTempController],
  providers: [DeliveryTempService],
})
export class DeliveryTempModule {}
