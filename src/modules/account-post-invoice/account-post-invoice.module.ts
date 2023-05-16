import { Module } from '@nestjs/common';
import { AccountPostInvoiceService } from './account-post-invoice.service';
import { AccountPostInvoiceController } from './account-post-invoice.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountVoucherSchema } from 'src/tableModels/accountVoucher.model';
import { AccountVoucherItemsSchema } from 'src/tableModels/accountVoucherItems.model';
import { AccountBookSchema } from 'src/tableModels/accountBook.model';
import { AccountOutstandingSchema } from 'src/tableModels/accountOutstanding.model';

@Module({
  imports:[MongooseModule.forFeature([
    { name:ModelNames.ACCOUNT_VOUCHER, schema:AccountVoucherSchema }, 
    { name: ModelNames.ACCOUNT_VOUCHER_ITEMS, schema: AccountVoucherItemsSchema },
    { name: ModelNames.ACCOUNT_BOOK, schema: AccountBookSchema },
    { name: ModelNames.ACCOUNT_OUTSTANDING, schema: AccountOutstandingSchema },
  ])],
  controllers: [AccountPostInvoiceController],
  providers: [AccountPostInvoiceService]
})
export class AccountPostInvoiceModule {}
