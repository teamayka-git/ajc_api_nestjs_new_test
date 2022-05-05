import { Module } from '@nestjs/common';
import { DeliveryChellanService } from './delivery-chellan.service';
import { DeliveryChellanController } from './delivery-chellan.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryChallansSchema } from 'src/tableModels/delivery_challans.model';
import { DeliveryChallanItemsSchema } from 'src/tableModels/delivery_challan_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_CHALLANS, schema: DeliveryChallansSchema },
      {
        name: ModelNames.DELIVERY_CHALLAN_ITEMS,
        schema: DeliveryChallanItemsSchema,
      },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [DeliveryChellanController],
  providers: [DeliveryChellanService],
})
export class DeliveryChellanModule {}
