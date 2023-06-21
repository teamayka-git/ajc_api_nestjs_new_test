import { Module } from '@nestjs/common';
import { MaterialReceiptService } from './material-receipt.service';
import { MaterialReceiptController } from './material-receipt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { MterialReceiptHeadsSchema } from 'src/tableModels/material_receipt_heads.model';
import { MterialReceiptItemsSchema } from 'src/tableModels/material_receipt_items.model';
import { MterialStocksSchema } from 'src/tableModels/material_stocks.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { BranchSchema } from 'src/tableModels/branch.model';
import { GoldRateTimelinesSchema } from 'src/tableModels/gold_rate_timelines.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelNames.MATERIAL_RECEIPT_HEADS,
        schema: MterialReceiptHeadsSchema,
      },
      {
        name: ModelNames.MATERIAL_RECEIPT_ITEMS,
        schema: MterialReceiptItemsSchema,
      },
      { name: ModelNames.MATERIAL_STOCKS, schema: MterialStocksSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.BRANCHES, schema: BranchSchema },
      { name: ModelNames.GOLD_RATE_TIMELINES, schema:GoldRateTimelinesSchema },
    ]),
  ],
  controllers: [MaterialReceiptController],
  providers: [MaterialReceiptService],
})
export class MaterialReceiptModule {}
