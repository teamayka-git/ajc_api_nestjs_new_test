import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { InvoicesSchema } from 'src/tableModels/invoices.model';
import { InvoiceItemsSchema } from 'src/tableModels/invoice_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { OrderSalesSchema } from 'src/tableModels/order_sales.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.INVOICES, schema: InvoicesSchema },
      {
        name: ModelNames.INVOICE_ITEMS,
        schema: InvoiceItemsSchema,
      },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.ORDER_SALES, schema: OrderSalesSchema },
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
