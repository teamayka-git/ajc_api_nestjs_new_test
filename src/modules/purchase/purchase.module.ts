import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { PurchasesSchema } from 'src/tableModels/purchase.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { PurchaseOrderSchema } from 'src/tableModels/purchase_order.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PURCHASES, schema: PurchasesSchema },
      { name: ModelNames.PURCHASE_ORDERS, schema: PurchaseOrderSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService]
})
export class PurchaseModule {}
