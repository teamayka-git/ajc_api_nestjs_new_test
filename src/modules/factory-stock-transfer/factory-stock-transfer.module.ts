import { Module } from '@nestjs/common';
import { FactoryStockTransferService } from './factory-stock-transfer.service';
import { FactoryStockTransferController } from './factory-stock-transfer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { FactoryStockTransferItemSchema } from 'src/tableModels/factory_stock_transfers_item.model';
import { FactoryStockTransfersSchema } from 'src/tableModels/factory_stock_transfers.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.FACTORY_STOCK_TRANSFERS, schema: FactoryStockTransfersSchema },
      { name: ModelNames.FACTORY_STOCK_TRANSFER_ITEMS, schema: FactoryStockTransferItemSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [FactoryStockTransferController],
  providers: [FactoryStockTransferService]
})
export class FactoryStockTransferModule {}
