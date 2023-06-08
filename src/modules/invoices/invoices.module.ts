import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { InvoicesSchema } from 'src/tableModels/invoices.model';
import { InvoiceItemsSchema } from 'src/tableModels/invoice_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { DeliveryTempSchema } from 'src/tableModels/delivery_temp.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { GeneralsSchema } from 'src/tableModels/generals.model';
import { ShopsSchema } from 'src/tableModels/shops.model';
import { PurchaseBookingSchema } from 'src/tableModels/purchase_booking.model';
import { AccountPostInvoiceService } from '../account-post-invoice/account-post-invoice.service';
import { AccountPostInvoiceModule } from '../account-post-invoice/account-post-invoice.module';
import { AccountVoucherSchema } from 'src/tableModels/accountVoucher.model';
import { AccountVoucherItemsSchema } from 'src/tableModels/accountVoucherItems.model';
import { AccountBookSchema } from 'src/tableModels/accountBook.model';
import { AccountOutstandingSchema } from 'src/tableModels/accountOutstanding.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelNames.ORDER_SALE_HISTORIES,
        schema: OrderSaleHistoriesSchema,
      },
      { name: ModelNames.DELIVERY_TEMP, schema: DeliveryTempSchema },
      { name: ModelNames.INVOICES, schema: InvoicesSchema },
      {
        name: ModelNames.INVOICE_ITEMS,
        schema: InvoiceItemsSchema,
      },
      {
        name: ModelNames.PURCHASE_BOOKINGS,
        schema: PurchaseBookingSchema,
      },
      
      { name: ModelNames.SHOPS, schema: ShopsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.GENERALS, schema: GeneralsSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema: OrderSalesMainSchema },

      { name:ModelNames.ACCOUNT_VOUCHER, schema:AccountVoucherSchema }, 
      { name: ModelNames.ACCOUNT_VOUCHER_ITEMS, schema: AccountVoucherItemsSchema },
      { name: ModelNames.ACCOUNT_BOOK, schema: AccountBookSchema },
      { name: ModelNames.ACCOUNT_OUTSTANDING, schema: AccountOutstandingSchema },
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService,
    AccountPostInvoiceModule
   ,AccountPostInvoiceService
  ],
})
export class InvoicesModule {}
