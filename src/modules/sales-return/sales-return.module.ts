import { Module } from '@nestjs/common';
import { SalesReturnService } from './sales-return.service';
import { SalesReturnController } from './sales-return.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { DeliveryTempSchema } from 'src/tableModels/delivery_temp.model';
import { PurchaseBookingSchema } from 'src/tableModels/purchase_booking.model';
import { ShopsSchema } from 'src/tableModels/shops.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { GeneralsSchema } from 'src/tableModels/generals.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { SalesReturnsSchema } from 'src/tableModels/sales_returns.model';
import { SalesReturnItemsSchema } from 'src/tableModels/sales_return_items.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelNames.ORDER_SALE_HISTORIES,
        schema: OrderSaleHistoriesSchema,
      },
      { name: ModelNames.DELIVERY_TEMP, schema: DeliveryTempSchema },
      { name: ModelNames.SALES_RETURNS, schema: SalesReturnsSchema },
      {
        name: ModelNames.SALES_RETURN_ITEMS,
        schema: SalesReturnItemsSchema,
      },
      {
        name: ModelNames.PURCHASE_BOOKINGS,
        schema: PurchaseBookingSchema,
      },

      { name: ModelNames.SHOPS, schema: ShopsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.GENERALS, schema: GeneralsSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema: OrderSalesMainSchema },
    ]),
  ],
  controllers: [SalesReturnController],
  providers: [SalesReturnService],
})
export class SalesReturnModule {}
