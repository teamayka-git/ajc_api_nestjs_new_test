import { Module } from '@nestjs/common';
import { DeliveryCounterBundleService } from './delivery-counter-bundle.service';
import { DeliveryCounterBundleController } from './delivery-counter-bundle.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryBundlesSchema } from 'src/tableModels/delivery_counter_bundles.model';
import { DeliveryCounterBundleItemsSchema } from 'src/tableModels/delivery_counter_bundle_items.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { OrderSalesDocumentsSchema } from 'src/tableModels/order_sales_documents.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { OrderSalesItemsSchema } from 'src/tableModels/order_sales_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { MterialStocksSchema } from 'src/tableModels/material_stocks.model';
import { AccountBranchSchema } from 'src/tableModels/accountBranch.model';
import { UserSchema } from 'src/tableModels/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.COUNTERS, schema:CountersSchema },
      { name: ModelNames.ORDER_SALES_ITEMS, schema:OrderSalesItemsSchema },
      { name: ModelNames.DELIVERY_COUNTER_BUNDLES, schema:DeliveryBundlesSchema },
      { name: ModelNames.DELIVERY_COUNTER_BUNDLE_ITEMS, schema:DeliveryCounterBundleItemsSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema:OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALES_DOCUMENTS, schema:OrderSalesDocumentsSchema },
      { name: ModelNames.ORDER_SALE_HISTORIES, schema:OrderSaleHistoriesSchema },

      { name: ModelNames.USER, schema: UserSchema },
      
      { name: ModelNames.MATERIAL_STOCKS, schema: MterialStocksSchema },
      { name: ModelNames.ACCOUNT_BRANCH, schema: AccountBranchSchema },
      ]),
  ],
  controllers: [DeliveryCounterBundleController],
  providers: [DeliveryCounterBundleService]
})
export class DeliveryCounterBundleModule {}
